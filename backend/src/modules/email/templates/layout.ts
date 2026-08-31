interface EmailLayoutOptions {
    title?: string;
    content: string;
    previewText?: string;
}

const LOGO_URL =
    "https://nwdgtxxduhownvgllzfw.supabase.co/storage/v1/object/public/emc_stockage_public/logo-lightmode.png";

export const emailLayout = ({
    title = "EMC HELPLINE",
    content,
    previewText = "",
}: EmailLayoutOptions): string => {
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${title}</title>

    <style>
        html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
        }

        body {
            background-color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #18181b;
        }

        table {
            border-spacing: 0;
            border-collapse: collapse;
        }

        td {
            padding: 0;
        }

        img {
            border: 0;
            display: block;
            max-width: 100%;
        }

        a {
            text-decoration: none;
        }

        @media only screen and (max-width: 620px) {
            .email-wrapper {
                width: 100% !important;
            }

            .email-container {
                width: 100% !important;
                border-radius: 0 !important;
            }

            .header {
                padding: 20px 24px !important;
            }

            .content {
                padding: 28px 24px !important;
            }

            .footer {
                padding: 24px 24px !important;
            }

            .title {
                font-size: 24px !important;
                line-height: 32px !important;
            }

            .button {
                display: block !important;
                width: auto !important;
                text-align: center !important;
            }
        }
    </style>
</head>

<body>

    <!-- Preview text -->
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
        ${previewText}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #f4f4f5;">
        <tr>
            <td align="center" style="padding: 40px 16px;">

                <table role="presentation" class="email-wrapper" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px;">

                    <tr>
                        <td class="email-container" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden;">

                            <!-- HEADER -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td class="header" style="padding: 24px 36px; border-bottom: 1px solid #e4e4e7;">
                                        <img
                                            src="${LOGO_URL}"
                                            alt="EMC Helpline"
                                            width="140"
                                            style="display: block; height: auto;"
                                        />
                                    </td>
                                </tr>
                            </table>

                            <!-- CONTENT -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td class="content" style="padding: 36px;">
                                        ${content}
                                    </td>
                                </tr>
                            </table>

                            <!-- FOOTER -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td class="footer" style="padding: 24px 36px; background-color: #fafafa; border-top: 1px solid #e4e4e7; text-align: center;">

                                        <div style="margin-bottom: 6px; color: #52525b; font-size: 12px; font-weight: 600;">
                                            EMC HELPLINE
                                        </div>

                                        <div style="margin-bottom: 12px; color: #a1a1aa; font-size: 11px; line-height: 17px;">
                                            Plateforme d'accompagnement et de signalement.
                                        </div>

                                        <div style="color: #a1a1aa; font-size: 10px; line-height: 16px;">
                                            Cet email contient des informations confidentielles.
                                            <br />
                                            Si vous n'êtes pas le destinataire, veuillez supprimer ce message.
                                        </div>

                                        <div style="margin-top: 14px; color: #d4d4d8; font-size: 10px;">
                                            © ${year} EMC HELPLINE. Tous droits réservés.
                                        </div>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
`;
};