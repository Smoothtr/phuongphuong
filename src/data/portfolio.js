const desktopWidths = [480, 768, 1200];

const imageAsset = (name, width, height, widths = desktopWidths) => {
  const largestWidth = widths[widths.length - 1];
  const srcSet = (format) =>
    widths
      .map((variantWidth) => "/images/optimized/" + name + "-" + variantWidth + "." + format + " " + variantWidth + "w")
      .join(", ");

  return {
    src: "/images/optimized/" + name + "-" + largestWidth + ".jpg",
    webpSrcSet: srcSet("webp"),
    jpegSrcSet: srcSet("jpg"),
    width,
    height
  };
};

export const heroImage = imageAsset("hero-main", 1366, 2048);
export const aboutImage = imageAsset("portrait-blush", 533, 799, [480]);

export const profile = {
  name: "Phương Phương",
  role: "Model · Actress",
  location: "Vietnam",
  email: "phuongvule2003@gmail.com",
  instagram: "https://www.instagram.com/hii.phuog?igsh=MTBxbHlhbjY4M2R1cQ==",
  facebook: "https://www.facebook.com/share/19TSLYqqRh/?mibextid=wwXIfr",
  press: [
    {
      label: "Báo Tiền Phong",
      href: "https://baomoi.com/tu-sinh-vien-kinh-te-den-nguoi-mau-anh-mang-khat-vong-quang-ba-van-hoa-viet-c52201435.epi"
    },
    {
      label: "VTV3",
      href: "https://vtv.vn/video/dep-24-7-lua-mem-cham-tam-714920.htm"
    }
  ]
};

export const measurements = [
  ["Height", "166 cm"],
  ["Leg", "94 cm"],
  ["Bust · Waist · Hips", "79 · 58 · 85"],
  ["Dress", "XS / S"],
  ["Shoes", "EU 38"],
  ["Hair · Eyes", "Black · Dark brown"]
];

export const works = [
  {
    id: "01",
    title: "Soft Focus",
    category: "Beauty editorial",
    image: imageAsset("editorial-high-01", 1714, 2400),
    alt: "Phương Phương in a blue patterned beauty look"
  },
  {
    id: "02",
    title: "Sunday Form",
    category: "Fashion campaign",
    image: imageAsset("editorial-high-02", 1800, 2400),
    alt: "Phương Phương wearing a gold gown in a studio setting"
  },
  {
    id: "03",
    title: "Still Moving",
    category: "Commercial",
    image: imageAsset("editorial-high-03", 1800, 2400),
    alt: "Phương Phương in a warm-toned fashion portrait"
  },
  {
    id: "04",
    title: "Quiet Gesture",
    category: "Fashion editorial",
    image: imageAsset("editorial-high-05", 1800, 2400),
    alt: "Phương Phương in a studio fashion editorial"
  },
  {
    id: "05",
    title: "A Soft Line",
    category: "Editorial",
    image: imageAsset("editorial-high-06", 1714, 2399),
    alt: "Phương Phương in a contemporary editorial portrait"
  },
  {
    id: "06",
    title: "Blue Hour",
    category: "Beauty",
    image: imageAsset("editorial-high-07", 1714, 2399),
    alt: "Phương Phương in a polished beauty campaign"
  },
  {
    id: "07",
    title: "Afterglow",
    category: "Commercial",
    image: imageAsset("editorial-high-08", 1714, 2400),
    alt: "Phương Phương in a commercial fashion image"
  },
  {
    id: "08",
    title: "On Set",
    category: "Fashion",
    image: imageAsset("fullbody-01", 1638, 2048),
    alt: "Phương Phương in a full-length fashion look"
  }
];

export const editorials = [
  {
    number: "01",
    title: "The Language of Flowers",
    subtitle: "Beauty / Spring",
    image: imageAsset("fullbody-02", 1638, 2048),
    alt: "Phương Phương in a full-length editorial portrait"
  },
  {
    number: "02",
    title: "Tactile Silence",
    subtitle: "Fashion / Studio",
    image: imageAsset("fullbody-03", 1638, 2048),
    alt: "Phương Phương in a studio fashion portrait"
  },
  {
    number: "03",
    title: "Dawn Study",
    subtitle: "Commercial / Motion",
    image: imageAsset("editorial-high-04", 2399, 1799),
    alt: "Phương Phương in a wide-format fashion editorial"
  }
];

export const reelFrames = [
  {
    image: imageAsset("beauty-wide", 800, 796, [480]),
    alt: "Phương Phương in a beauty portrait"
  },
  {
    image: imageAsset("look-01", 533, 799, [480]),
    alt: "Phương Phương in a tailored fashion look"
  },
  {
    image: imageAsset("look-02", 640, 800, [480]),
    alt: "Phương Phương in a pale blue fashion look"
  },
  {
    image: imageAsset("look-03", 522, 798, [480]),
    alt: "Phương Phương in a minimalist studio portrait"
  },
  {
    image: imageAsset("campaign-03", 639, 799, [480]),
    alt: "Phương Phương in a commercial campaign portrait"
  }
];
