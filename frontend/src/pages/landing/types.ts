export type Language = "fr" | "ar";

export type Translation = {
  header: {
    home: string;
    services: string;
    about: string;
    contact: string;
  };

  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    description: string;
    report: string;
    discover: string;
    confidential: string;
    secure: string;
    support: string;
    protectionTitle: string;
    protectionDescription: string;
  };

  services: {
    label: string;
    title: string;
    titleHighlight: string;
    description: string;

    report: {
      title: string;
      description: string;
      action: string;
    };

    support: {
      title: string;
      description: string;
      action: string;
    };

    legal: {
      title: string;
      description: string;
      action: string;
    };
  };

  partners: {
    label: string;
    title: string;
    description: string;
  };

  howItWorks: {
    label: string;
    title: string;
    description: string;

    step1: {
      title: string;
      description: string;
    };

    step2: {
      title: string;
      description: string;
    };

    step3: {
      title: string;
      description: string;
    };
  };

  cyberviolence: {
    label: string;
    title: string;
    titleHighlight: string;
    description: string;
    report: string;

    types: {
      harassment: string;
      threats: string;
      blackmail: string;
      identity: string;
      intimate: string;
      hate: string;
      inappropriate: string;
      other: string;
    };
  };

  whyUs: {
    label: string;
    title: string;
    description: string;

    confidentiality: {
      title: string;
      description: string;
    };

    security: {
      title: string;
      description: string;
    };

    support: {
      title: string;
      description: string;
    };
  };

  about: {
    label: string;
    title: string;
    titleHighlight: string;

    paragraph1: string;
    paragraph2: string;

    points: {
      accessible: string;
      confidential: string;
      orientation: string;
    };

    cardTitle: string;
    cardDescription: string;

    confidentiality: string;
    support: string;
  };

  faq: {
    label: string;
    title: string;
    description: string;

    q1: string;
    a1: string;

    q2: string;
    a2: string;

    q3: string;
    a3: string;

    q4: string;
    a4: string;
  };

  contact: {
    label: string;
    title: string;
    description: string;
    report: string;

    whatsapp: string;
    whatsappDescription: string;

    phone: string;
    email: string;

    privacy: string;

    whatsappModalTitle: string;
    phoneModalTitle: string;
    emailModalTitle: string;

    whatsappText: string;
    whatsappText2: string;
    workingHours: string;
    whatsappNumber: string;

    phoneText: string;
    phoneNumber: string;

    emailText: string;
    emailAddress: string;

    continueWhatsapp: string;
    callNow: string;
    sendEmail: string;
    close: string;
  };

  footer: {
    description: string;

    home: string;
    services: string;
    about: string;
    contact: string;

    rights: string;
  };
};