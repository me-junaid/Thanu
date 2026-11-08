export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  formattedPrice: string;
  mileage: string;
  fuelType: "Petrol" | "Hybrid" | "Electric" | "Diesel";
  transmission: "Automatic" | "Manual" | "PDK" | "Dual-Clutch";
  bodyType: "Coupe" | "Sedan" | "SUV" | "Wagon" | "Convertible";
  ownership: string;
  location: string;
  image: string;
  featured?: boolean;
  certified: boolean;
}

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "veh-01",
    brand: "Porsche",
    model: "911 Carrera S",
    variant: "Coupe (992)",
    year: 2023,
    price: 18500000,
    formattedPrice: "₹1,85,00,000",
    mileage: "12,400 km",
    fuelType: "Petrol",
    transmission: "PDK",
    bodyType: "Coupe",
    ownership: "1 Owner",
    location: "Apex Motors • Showroom Floor",
    image:
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=900&q=80",
    featured: true,
    certified: true,
  },
  {
    id: "veh-02",
    brand: "Mercedes-AMG",
    model: "GT 63 S",
    variant: "4-Door Coupé 4MATIC+",
    year: 2022,
    price: 16200000,
    formattedPrice: "₹1,62,00,000",
    mileage: "18,200 km",
    fuelType: "Petrol",
    transmission: "Dual-Clutch",
    bodyType: "Coupe",
    ownership: "Single Owner",
    location: "Apex Motors • Showroom Floor",
    image:
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=80",
    featured: true,
    certified: true,
  },
  {
    id: "veh-03",
    brand: "BMW",
    model: "M4 Competition",
    variant: "xDrive G82",
    year: 2024,
    price: 12800000,
    formattedPrice: "₹1,28,00,000",
    mileage: "6,100 km",
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "Coupe",
    ownership: "Corporate Demo",
    location: "Apex Motors • Showroom Floor",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",
    featured: false,
    certified: true,
  },
  {
    id: "veh-04",
    brand: "Audi",
    model: "RS6 Avant",
    variant: "TFSI Quattro Dynamic",
    year: 2023,
    price: 17500000,
    formattedPrice: "₹1,75,00,000",
    mileage: "14,800 km",
    fuelType: "Hybrid",
    transmission: "Automatic",
    bodyType: "Wagon",
    ownership: "1 Owner",
    location: "Apex Motors • Showroom Floor",
    image:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=900&q=80",
    featured: false,
    certified: true,
  },
  {
    id: "veh-05",
    brand: "Aston Martin",
    model: "Vantage V8",
    variant: "Aero Track Edition",
    year: 2021,
    price: 21000000,
    formattedPrice: "₹2,10,00,000",
    mileage: "21,500 km",
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "Coupe",
    ownership: "Collector Owned",
    location: "Apex Motors • Showroom Floor",
    image:
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=900&q=80",
    featured: false,
    certified: true,
  },
  {
    id: "veh-06",
    brand: "Porsche",
    model: "Taycan Turbo S",
    variant: "Performance Battery Plus",
    year: 2023,
    price: 19500000,
    formattedPrice: "₹1,95,00,000",
    mileage: "11,000 km",
    fuelType: "Electric",
    transmission: "Automatic",
    bodyType: "Sedan",
    ownership: "1 Owner",
    location: "Apex Motors • Showroom Floor",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    featured: false,
    certified: true,
  },
  {
    id: "veh-07",
    brand: "Land Rover",
    model: "Defender 110 V8",
    variant: "Carpathian Edition 5.0L",
    year: 2023,
    price: 19800000,
    formattedPrice: "₹1,98,00,000",
    mileage: "9,500 km",
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    ownership: "1 Owner",
    location: "Apex Motors • Showroom Floor",
    image:
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80",
    featured: true,
    certified: true,
  },
  {
    id: "veh-08",
    brand: "Mercedes-AMG",
    model: "G 63",
    variant: "Biturbo 4MATIC SUV",
    year: 2023,
    price: 28500000,
    formattedPrice: "₹2,85,00,000",
    mileage: "14,200 km",
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    ownership: "1 Owner",
    location: "Apex Motors • Showroom Floor",
    image:
      "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=900&q=80",
    featured: true,
    certified: true,
  },
  {
    id: "veh-09",
    brand: "BMW",
    model: "M5 Competition",
    variant: "xDrive V8 Twin-Turbo",
    year: 2022,
    price: 13500000,
    formattedPrice: "₹1,35,00,000",
    mileage: "16,800 km",
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "Sedan",
    ownership: "Single Owner",
    location: "Apex Motors • Showroom Floor",
    image:
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80",
    featured: false,
    certified: true,
  },
];
