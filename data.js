// Sumber: toyota.com.my/en/price-and-model-tools/price-list.html (22 Nov 2026)
// Harga OTR termasuk SST, tanpa insurans, Individual Private, Semenanjung Malaysia. Boleh berubah bila-bila masa.
const U = "https://www.toyota.com.my/en/models/";
window.CARS = [
  { id: "vios", name: "Vios", type: "Sedan", img: "assets/cars/vios.jpg", url: U + "vios.html",
    grades: [["Vios 1.5E AT", "Petrol", 90600], ["Vios 1.5G AT", "Petrol", 96600], ["Vios 1.5 HEV AT", "HEV", 103900]] },
  { id: "yaris", name: "Yaris", type: "Hatchback", img: "assets/cars/yaris.jpg", url: U + "yaris.html",
    grades: [["Yaris 1.5E AT", "Petrol", 90400], ["Yaris 1.5G AT", "Petrol", 96400]] },
  { id: "yaris-cross", name: "Yaris Cross", type: "SUV", img: "assets/cars/yaris-cross.jpg", url: U + "yaris-cross-hybrid-electric/yaris-cross.html",
    grades: [["Yaris Cross 1.5S", "Petrol", 99900], ["Yaris Cross 1.5S HEV", "HEV", 109900]] },
  { id: "corolla", name: "Corolla", type: "Sedan", img: "assets/cars/corolla.jpg", url: U + "corolla.html",
    grades: [["Corolla 1.8G", "Petrol", 144800]] },
  { id: "corolla-cross", name: "Corolla Cross", type: "SUV", img: "assets/cars/corolla-cross.jpg", url: U + "corolla-cross-hybrid-electric.html",
    grades: [["Corolla Cross 1.8V AT", "Petrol", 133800], ["Corolla Cross HEV", "HEV", 140800], ["Corolla Cross HEV GR Sport", "HEV", 148800]] },
  { id: "camry", name: "Camry", type: "Sedan", img: "assets/cars/camry.jpg", url: U + "camry-hybrid-electric.html",
    grades: [["Camry 2.5V AT", "Petrol", 221800], ["Camry 2.5 HEV", "HEV", 248800]] },
  { id: "veloz", name: "Veloz", type: "MPV", img: "assets/cars/veloz.jpg", url: U + "veloz.html",
    grades: [["Veloz 1.5 AT", "Petrol", 95000]] },
  { id: "zenix", name: "Innova Zenix", type: "MPV", img: "assets/cars/zenix.jpg", url: U + "zenix.html",
    grades: [["Innova Zenix 2.0V", "Petrol", 165000], ["Innova Zenix 2.0 HEV", "HEV", 202000]] },
  { id: "fortuner", name: "Fortuner", type: "SUV", img: "assets/cars/fortuner.jpg", url: U + "fortuner.html",
    grades: [["Fortuner 2.4 AT 4WD", "Diesel", 195880], ["Fortuner 2.7 SRZ AT 4WD", "Petrol", 202880], ["Fortuner 2.8 VRZ AT 4WD", "Diesel", 241880]] },
  { id: "hilux", name: "Hilux", type: "Pickup", img: "assets/cars/hilux.jpg", url: U + "hilux.html",
    grades: [["Hilux Single Cab 2.4 MT 4WD", "Diesel", 104880], ["Hilux Double Cab 2.4E MT 4WD", "Diesel", 117880], ["Hilux Double Cab 2.4E AT 4WD", "Diesel", 119880], ["Hilux Double Cab 2.4V AT 4WD", "Diesel", 149580], ["Hilux Double Cab 2.8 Rogue AT 4WD", "Diesel", 163080]] },
  { id: "hiace", name: "Hiace", type: "Van", img: "assets/cars/hiace.jpg", url: U + "hiace.html",
    grades: [["Hiace Panel Van 3.0 Turbo Diesel", "Diesel", 127800]] },
  { id: "harrier", name: "Harrier", type: "SUV", img: "assets/cars/harrier.jpg", url: U + "harrier-hybrid-electric.html",
    grades: [["Harrier 2.5 HEV", "HEV", 289000]] },
  { id: "alphard", name: "Alphard", type: "MPV", img: "assets/cars/alphard.jpg", url: U + "alphard.html",
    grades: [["Alphard 2.4T Executive Lounge", "Petrol", 548000]] },
  { id: "vellfire", name: "Vellfire", type: "MPV", img: "assets/cars/vellfire.jpg", url: U + "vellfire.html",
    grades: [["Vellfire 2.5", "Petrol", 448000], ["Vellfire 2.5 HEV Executive Lounge", "HEV", 549900]] }
];
