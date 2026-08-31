import { emailLayout } from "../layout";

interface UserCreatedEmailData {
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    temporaryPassword: string;
    loginUrl: string;
}

export const userCreatedTemplate = ({
    firstName,
    lastName,
    email,
    role,
    temporaryPassword,
    loginUrl,
}: UserCreatedEmailData) => {
    const content = `
        <div style="margin-bottom: 24px;">
            <h1 style="margin: 0 0 8px; color: #18181b; font-size: 22px; line-height: 30px;">
                Bonjour ${firstName},
            </h1>
            <p style="margin: 0; color: #52525b; font-size: 14px; line-height: 22px;">
                Votre compte EMC HELPLINE a été créé avec succès.
            </p>
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
            <tr>
                <td style="padding: 16px 18px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px;">
                    <p style="margin: 0 0 8px; color: #71717a; font-size: 13px;">
                        Nom&nbsp;: <strong style="color: #18181b;">${firstName} ${lastName}</strong>
                    </p>
                    <p style="margin: 0 0 ${role ? "8px" : "0"}; color: #71717a; font-size: 13px;">
                        Email&nbsp;: <strong style="color: #18181b;">${email}</strong>
                    </p>
                    ${
                        role
                            ? `<p style="margin: 0; color: #71717a; font-size: 13px;">
                        Rôle&nbsp;: <strong style="color: #18181b;">${role}</strong>
                    </p>`
                            : ""
                    }
                </td>
            </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
            <tr>
                <td style="padding: 16px 18px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 6px;">
                    <p style="margin: 0 0 10px; color: #71717a; font-size: 13px;">
                        Mot de passe temporaire&nbsp;:
                    </p>
                    <div style="display: inline-block; padding: 8px 12px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 4px; color: #18181b; font-family: monospace; font-size: 14px; font-weight: 600;">
                        ${temporaryPassword}
                    </div>
                </td>
            </tr>
        </table>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
            <tr>
                <td style="background-color: #18181b; border-radius: 6px;">
                    <a
                        href="${loginUrl}"
                        target="_blank"
                        class="button"
                        style="display: inline-block; padding: 12px 20px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none;"
                    >
                        Accéder à mon espace
                    </a>
                </td>
            </tr>
        </table>

        <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 18px;">
            Pour votre sécurité, nous vous recommandons de modifier votre mot de passe temporaire dès votre première connexion.
        </p>
    `;

    return emailLayout({
        title: "Bienvenue sur EMC HELPLINE",
        previewText: "Votre compte EMC HELPLINE a été créé avec succès.",
        content,
    });
};