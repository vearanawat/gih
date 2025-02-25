import Papa from 'papaparse';

interface MedicineRecord {
  name: string;
  generic_name: string;
  dosage_forms: string[];
  strengths: string[];
  manufacturer: string;
}

let medicineDatabase: MedicineRecord[] = [];

export const loadMedicineDatabase = async () => {
  const response = await fetch('/medicines.csv');
  const csv = await response.text();
  
  const results = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true
  });
  
  medicineDatabase = results.data as MedicineRecord[];
};

export const findMatchingMedicine = (text: string): MedicineRecord | null => {
  const normalizedText = text.toLowerCase();
  
  return medicineDatabase.find(medicine => 
    normalizedText.includes(medicine.name.toLowerCase()) ||
    normalizedText.includes(medicine.generic_name.toLowerCase())
  ) || null;
}; 