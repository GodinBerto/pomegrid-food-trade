
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
}

interface CloudinaryDeleteResponse {
  result: string;
  [key: string]: unknown;
}

type CloudinaryResourceType = "image" | "video";
type CloudinaryUploadFolder =
  | "profile/images"
  | "products/images"
  | "product/videos";

const CLOUDINARY_CLOUD_NAME = "dquhjbcvq";
const CLOUDINARY_UPLOAD_PRESET = "ml_default";
const IMAGE_MAX_DIMENSION = 1600;
const IMAGE_OUTPUT_QUALITY = 0.82;
const MIN_IMAGE_SIZE_TO_OPTIMIZE = 250 * 1024; // 250KB
const PROFILE_IMAGES_FOLDER: CloudinaryUploadFolder = "profile/images";
const PRODUCT_IMAGES_FOLDER: CloudinaryUploadFolder = "products/images";
const PRODUCT_VIDEOS_FOLDER: CloudinaryUploadFolder = "product/videos";

const uploadToCloudinary = async (
  file: File,
  resourceType: CloudinaryResourceType,
  folder: CloudinaryUploadFolder
): Promise<string> => {
  const fileToUpload =
    resourceType === "image" ? await optimizeImageForUpload(file) : file;

  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  try {
    console.log(`Uploading ${resourceType} to Cloudinary...`);
    console.log("File details:", {
      originalName: file.name,
      originalSize: file.size,
      uploadName: fileToUpload.name,
      uploadSize: fileToUpload.size,
      type: fileToUpload.type,
      folder,
      optimized: fileToUpload.size < file.size,
    });
    console.log("Upload URL:", uploadUrl);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    console.log("Cloudinary response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary error response:", errorText);

      if (response.status === 400) {
        throw new Error(
          `Upload failed: Invalid upload preset or configuration. Please check your Cloudinary settings. Error: ${errorText}`
        );
      }

      throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
    }

    const data: CloudinaryUploadResponse = await response.json();
    console.log(`${resourceType} uploaded successfully:`, data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error(`Error uploading ${resourceType} to Cloudinary:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to upload ${resourceType} to Cloudinary`);
  }
};

export const uploadProfileImageToCloudinary = async (
  file: File
): Promise<string> => {
  return uploadToCloudinary(file, "image", PROFILE_IMAGES_FOLDER);
};

export const uploadProductImageToCloudinary = async (
  file: File
): Promise<string> => {
  return uploadToCloudinary(file, "image", PRODUCT_IMAGES_FOLDER);
};

export const uploadProductVideoToCloudinary = async (
  file: File
): Promise<string> => {
  return uploadToCloudinary(file, "video", PRODUCT_VIDEOS_FOLDER);
};

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  return uploadProductImageToCloudinary(file);
};

export const uploadVideoToCloudinary = async (file: File): Promise<string> => {
  return uploadProductVideoToCloudinary(file);
};

const deleteFromCloudinary = async (
  mediaUrl: string,
  resourceType: CloudinaryResourceType
): Promise<boolean> => {
  try {
    const publicId = extractPublicIdFromUrl(mediaUrl);
    if (!publicId) {
      console.log(`No valid public ID found in ${resourceType} URL:`, mediaUrl);
      return false;
    }

    console.log(`Deleting ${resourceType} from Cloudinary, public_id:`, publicId);

    const deleteUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`;

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(deleteUrl, {
      method: "POST",
      body: formData,
    });

    console.log("Cloudinary delete response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary delete error response:", errorText);
      return false;
    }

    const data: CloudinaryDeleteResponse = await response.json();
    console.log(`${resourceType} deletion result:`, data.result);

    return data.result === "ok";
  } catch (error) {
    console.error(`Error deleting ${resourceType} from Cloudinary:`, error);
    return false;
  }
};

export const deleteImageFromCloudinary = async (
  imageUrl: string
): Promise<boolean> => {
  return deleteFromCloudinary(imageUrl, "image");
};

export const deleteVideoFromCloudinary = async (
  videoUrl: string
): Promise<boolean> => {
  return deleteFromCloudinary(videoUrl, "video");
};

interface BackgroundCloudinaryCleanupInput {
  imageUrls?: string[];
  videoUrls?: string[];
}

export const cleanupCloudinaryMediaInBackground = ({
  imageUrls = [],
  videoUrls = [],
}: BackgroundCloudinaryCleanupInput): void => {
  const uniqueImageUrls = [...new Set(imageUrls.filter(Boolean))];
  const uniqueVideoUrls = [...new Set(videoUrls.filter(Boolean))];

  if (uniqueImageUrls.length === 0 && uniqueVideoUrls.length === 0) {
    return;
  }

  void Promise.allSettled([
    ...uniqueImageUrls.map((imageUrl) => deleteImageFromCloudinary(imageUrl)),
    ...uniqueVideoUrls.map((videoUrl) => deleteVideoFromCloudinary(videoUrl)),
  ]).then((results) => {
    const successCount = results.filter(
      (result) => result.status === "fulfilled" && result.value
    ).length;

    console.log(
      `Background media cleanup completed: ${successCount}/${results.length} deleted`
    );
  });
};

// Helper function to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const urlParts = url.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) return null;

    let publicIdParts = urlParts.slice(uploadIndex + 1);
    if (publicIdParts.length === 0) return null;

    if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
      publicIdParts = publicIdParts.slice(1);
    }

    if (publicIdParts.length === 0) return null;

    const lastPart = publicIdParts[publicIdParts.length - 1];
    const extensionDotIndex = lastPart.lastIndexOf(".");
    const sanitizedLastPart =
      extensionDotIndex > 0 ? lastPart.slice(0, extensionDotIndex) : lastPart;

    publicIdParts[publicIdParts.length - 1] = sanitizedLastPart;

    const publicId = publicIdParts.map((part) => decodeURIComponent(part)).join("/");
    return publicId || null;
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
};

const shouldSkipImageOptimization = (file: File): boolean => {
  if (!file.type.startsWith("image/")) {
    return true;
  }

  return file.type === "image/gif" || file.type === "image/svg+xml";
};

const replaceFileExtension = (fileName: string, extension: string): string => {
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  return `${baseName}.${extension}`;
};

const loadImageFromObjectUrl = (objectUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to decode image."));
    image.src = objectUrl;
  });
};

const optimizeImageForUpload = async (file: File): Promise<File> => {
  if (shouldSkipImageOptimization(file) || file.size < MIN_IMAGE_SIZE_TO_OPTIMIZE) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageFromObjectUrl(objectUrl);
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;

    if (!sourceWidth || !sourceHeight) {
      return file;
    }

    const maxSourceDimension = Math.max(sourceWidth, sourceHeight);
    const scale =
      maxSourceDimension > IMAGE_MAX_DIMENSION
        ? IMAGE_MAX_DIMENSION / maxSourceDimension
        : 1;

    const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const optimizedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", IMAGE_OUTPUT_QUALITY);
    });

    if (!optimizedBlob || optimizedBlob.size >= file.size) {
      return file;
    }

    const optimizedFile = new File(
      [optimizedBlob],
      replaceFileExtension(file.name, "webp"),
      {
        type: "image/webp",
        lastModified: Date.now(),
      }
    );

    console.log("Image optimized before upload:", {
      originalSize: file.size,
      optimizedSize: optimizedFile.size,
      width: sourceWidth,
      height: sourceHeight,
      outputWidth: targetWidth,
      outputHeight: targetHeight,
    });

    return optimizedFile;
  } catch (error) {
    console.error("Image optimization failed. Uploading original image.", error);
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};
