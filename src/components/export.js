import { useRef } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import Papa from "papaparse";
import { toast } from "react-hot-toast";

const Export = ({ carData }) => {
    const handleDownloadTransaction = event => {
        event.preventDefault();

        // Define the custom column names
        const columnNames = [
            "Brand",
            "Price",
            "Model",
            "Type",
            "Variant",
            "Engine",
            "Engine Type",
            "Cylinder",
            "Fuel Type",
            "Max Power",
            "Max Torque",
            "Transmission",
            "NCAP",
            "Airbags",
            "ABS",
            "ESP",
            "EBD",
            "Hill Hold",
            "Traction Control",
            "Power Steering",
            "AC",
            "Infotainment",
            "Smart Connectivity",
            "Cruise Control",
            "Engine Start/Stop Button",
            "Sunroof",
            "Camera",
            "Length",
            "Width",
            "Height",
            "Wheelbase",
            "Ground Clearance",
            "Kerb Weight",
            "Boot Space",
            "Fuel Tank",
            "Warranty",
            "Warranty Kilometres"
        ];

        const modifiedData = carData.map(row => {
            const modifiedRow = {};
            Object.keys(row).forEach((key, index) => {
                modifiedRow[columnNames[index]] = row[key];
            });
            return modifiedRow;
        });

        const csv = Papa.unparse(modifiedData);
        const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(csvData);
        link.download = "cars.csv";
        link.click();

        return toast.success("Your file is ready to download");
    };

    return (
        <div>
            <button
                onClick={handleDownloadTransaction}
                className="relative mr-4 font-sm inline-flex items-center border border-gray-300 bg-white py-[10px] text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 rounded-md px-[12px] sm:px-[8px]"
            >
                {" "}
                <ArrowDownTrayIcon
                    width={20}
                    height={20}
                    title="Upload"
                    className="max-xs:mr-0 mr-[1px] mt-[0px] h-4 w-4 text-black"
                />
                <span className="sr-only">Download transitions</span>
                <span className="hidden sm:ml-1 sm:inline-block">Export as CSV</span>
            </button>
        </div>
    );
};

export default Export;
