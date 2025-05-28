export default {
  attributes: {
    // Ces champs seront ajoutés au modèle User existant
    bio: {
      type: "text",
      default: ""
    },
    phoneNumber: {
      type: "string",
      default: ""
    },
    address: {
      type: "string",
      default: ""
    },
    avatar: {
      type: "media",
      multiple: false
    }
  }
};