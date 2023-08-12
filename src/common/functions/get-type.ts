import { AttachmentTypes } from "../../modules/attachments/attachment.model";

class AssociatedType {
    extensions: string[];
    type: AttachmentTypes;

    constructor(type: AttachmentTypes, extensions: string[]) {
        this.extensions = extensions;
        this.type = type;
    }
}

const imageType: AssociatedType = new AssociatedType(
    AttachmentTypes.IMAGE,
    ["png", "jpeg", "jpg", "gif"]
);

const audioType: AssociatedType = new AssociatedType(
    AttachmentTypes.AUDIO,
    ["mp3"]
);

const videoType: AssociatedType = new AssociatedType(
    AttachmentTypes.VIDEO,
    ["mp4"]
);

const associatedTypes: AssociatedType[] = [
    audioType,
    videoType,
    imageType
]

/** Identifies type by filename */
export default function getType(filename: string): AttachmentTypes {
    const extension = filename.split('.').pop();
    for (const associatedType of associatedTypes) {
        if (associatedType.extensions.includes(extension))
            return associatedType.type;
    }
    return AttachmentTypes.FILE;
}