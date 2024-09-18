export const getRandomArbitrary = (min: number, max: number): number => {
  const value = Math.random() * (max - min) + min;
  return parseInt(value.toFixed(0));
};

export const fixName = async (name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!name) resolve("-");

    var theName = name
      .replace(/[^a-z0-9]/gi, " ")
      .replace(/ +(?= )/g, "")
      .trim();

    if (theName) {
      if (theName.split(/[\s,\-]+/).length > 1) {
        let newName = "";
        theName.split(/[\s,\-]+/).forEach((theName_cut) => {
          if (theName_cut) {
            newName = newName + " " + theName_cut.toLowerCase();
          }
        });
        theName = newName.slice(1);
      } else {
        theName = theName.toLowerCase();
      }

      resolve(theName);
    } else {
      resolve("-");
    }
  });
};

export const presentName = async (name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (name) {
      // console.log({ name });
      let newName = "";
      if (name.split("-").length > 1) {
        name.split("-").forEach((word) => {
          newName =
            newName + "-" + word.slice(0, 1).toUpperCase() + word.slice(1);
        });
        name = newName.slice(1);
      } else {
        name = name.slice(0, 1).toUpperCase() + name.slice(1);
      }
      resolve(name);
    } else {
      resolve("");
    }
  });
};
