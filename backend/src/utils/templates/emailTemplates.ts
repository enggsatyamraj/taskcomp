import { EmailType } from "../enums";

interface EmailTemplates {
    [key: string]: {
        subject: string;
        html: string;
    }
}

export const EMAIL_TEMPLATES = (payload: { [key: string]: any }, key: EmailType) => {
    const values: EmailTemplates = {

    }
    return values[key]
}