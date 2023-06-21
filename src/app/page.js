"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Balancer from "react-wrap-balancer";
import { toast } from "react-hot-toast";
import { produce } from "immer";
import { TrashIcon } from "@heroicons/react/20/solid";
import { Card, Title, BarChart, Subtitle } from "@tremor/react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import Table, { AvatarCell, SelectColumnFilter, StatusPill } from "../components/table";
import Dialog from "../components/dialog";
import SquigglyLines from "../components/squigglyLines";
import { calculateScores } from "./utils";
import useAutoFocus from "./hooks/useAutoFocus";

const initialState = {
    brand: "",
    price: "",
    model: "",
    type: "",
    variant: "",
    engine: "",
    engineType: "",
    cylinder: "",
    fuelType: "",
    maxPower: "",
    maxTorque: "",
    transmission: "",
    ncap: "Not Rated",
    airBags: "",
    abs: false,
    ebd: false,
    esp: false,
    hillHold: false,
    tractionControl: false,
    powerSteering: false,
    ac: "",
    infotainment: false,
    smartConnectivity: "",
    speakers: "",
    cruiseControl: false,
    engineButton: false,
    sunroof: "",
    length: "",
    width: "",
    height: "",
    wheelBase: "",
    groundClearance: "",
    fuelTank: "",
    kerbWeight: "",
    boot: "",
    warranty: "",
    warrantyKilometres: ""
};

const initialMock = [
    {
        brand: "Tata",
        price: "1100000",
        model: "Nexon",
        type: "Compact SUV",
        variant: "XZ Plus",
        engine: "1199 cc",
        engineType: "1.2L Turbocharged Revotron",
        cylinder: "3",
        fuelType: "Petrol",
        maxPower: "118 bhp @ 5500 rpm",
        maxTorque: "170 Nm @ 1750 rpm",
        transmission: "Manual",
        ncap: "5",
        airBags: "2",
        abs: true,
        ebd: true,
        esp: true,
        hillHold: true,
        tractionControl: true,
        powerSteering: true,
        ac: "Automatic",
        infotainment: true,
        smartConnectivity: "Both",
        speakers: "8",
        cruiseControl: false,
        engineButton: true,
        sunroof: false,
        length: "3993 mm",
        width: "1811 mm",
        height: "1606 mm",
        wheelBase: "2498 mm",
        groundClearance: "209 mm",
        fuelTank: "44 litres",
        kerbWeight: "1250 kg",
        boot: "350 litres",
        warranty: "3",
        warrantyKilometres: "100000"
    },
    {
        brand: "Hyundai",
        price: "976000",
        model: "Venue",
        type: "Compact SUV",
        variant: "S (O)",
        engine: "1197 cc",
        engineType: "1.2L Kappa",
        cylinder: "4",
        maxPower: "82 bhp @ 6000 rpm",
        maxTorque: "114 Nm @ 4000 rpm",
        transmission: "Manual",
        safetyRating: "NA",
        airBags: "4",
        abs: true,
        esp: true,
        ebd: true,
        hillHold: true,
        tractionControl: true,
        powerSteering: true,
        ac: "Manual",
        powerSteering: true,
        infotainment: true,
        smartConnectivity: true,
        cruiseControl: false,
        sunroof: false,
        camera: "Rear",
        length: "3995 mm",
        width: "1770 mm",
        height: "1617 mm",
        wheelBase: "2500 mm",
        groundClearance: "195 mm",
        kerbWeight: "1233 kg",
        boot: "350 litres",
        fuelTank: "45 litres",
        warranty: "3",
        warrantyKilometres: "Unlimited"
    }
];

export default function Home() {
    const [carData, setCarData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [skipPageReset, setSkipPageReset] = React.useState(false);
    const [modalState, setModalState] = useState(initialState);
    const [barChartData, setBarChartData] = useState([]);
    const [carTypeFilterValue, setCarTypeFilterValue] = useState("");
    const inputRef = useAutoFocus();
    const carTypes = [...new Set(carData.map(car => car.type))];

    const handleCheckbox = useCallback(
        (key, value, row) => {
            const rowIndex = row.id; // Get the index of the current row
            const updatedData = produce(carData, draft => {
                draft[rowIndex][key] = !value; // Update the 'key' property of the specific object
            });

            setCarData(updatedData);
        },
        [carData]
    );

    const handleSelection = useCallback(
        (key, value, row) => {
            const rowIndex = row.id; // Get the index of the current row
            const updatedData = produce(carData, draft => {
                draft[rowIndex][key] = value; // Update the 'key' property of the specific object
            });

            setCarData(updatedData);
        },
        [carData]
    );

    const handleAddNewCar = event => {
        event.preventDefault();
        // Append the new object to the existing data or create a new array with it
        const updatedData = produce(carData, draft => {
            draft.push(modalState);
        });
        setCarData(updatedData);
        setIsModalOpen(false);
        toast.success("Car data updated successfully");
    };

    // When our cell renderer calls updateMyData, we'll use
    // the rowIndex, columnId and new value to update the
    // original data
    const updateTableData = (rowIndex, columnId, value) => {
        setSkipPageReset(true);
        setCarData(old =>
            produce(old, draft => {
                draft[rowIndex][columnId] = value;
            })
        );
    };

    const columns = useMemo(
        () => [
            {
                Header: "Basic",
                columns: [
                    {
                        Header: "Price",
                        accessor: "price",
                        Filter: SelectColumnFilter,
                        filter: "includes"
                    },
                    {
                        Header: "Brand",
                        accessor: "brand",
                        disableSortBy: true,
                        Filter: SelectColumnFilter,
                        filter: "includes"
                    },
                    {
                        Header: "Model",
                        accessor: "model",
                        disableSortBy: true
                    },
                    {
                        Header: "Type",
                        accessor: "type",
                        disableSortBy: true,
                        Cell: ({ row, value }) => (
                            <select
                                className="inline-flex rounded-md border border-gray-300 py-[6px] px-[9px] text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                                value={value}
                                onChange={e => {
                                    const type = e.target.value;
                                    handleSelection("type", type, row);
                                }}
                            >
                                {["SUV", "Sedan", "Hatchback", "Compact SUV", "Compact Sedan"].map(
                                    ty => (
                                        <option key={ty} value={ty}>
                                            {ty}
                                        </option>
                                    )
                                )}
                            </select>
                        )
                    },
                    {
                        Header: "Variant/Version",
                        accessor: "variant",
                        disableSortBy: true
                    }
                ],
                disableSortBy: true
            },
            {
                Header: "Engine & Transmission",
                disableSortBy: true,
                columns: [
                    {
                        Header: "Engine",
                        accessor: "engine",
                        disableSortBy: true
                    },
                    {
                        Header: "Engine Type",
                        accessor: "engineType",
                        disableSortBy: true
                    },
                    {
                        Header: "Cylinder",
                        accessor: "cylinder",
                        disableSortBy: true,
                        Cell: ({ row, value }) => (
                            <select
                                className="inline-flex rounded-md border border-gray-300 py-[6px] px-[9px] text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                                value={value}
                                onChange={e => {
                                    const cylinder = e.target.value;
                                    handleSelection("cylinder", cylinder, row);
                                }}
                            >
                                {["3", "4"].map(cy => (
                                    <option key={cy} value={cy}>
                                        {cy}
                                    </option>
                                ))}
                            </select>
                        )
                    },
                    {
                        Header: "Fuel Type",
                        accessor: "fuelType",
                        disableSortBy: true,
                        Cell: ({ row, value }) => (
                            <select
                                className="inline-flex rounded-md border border-gray-300 py-[6px] px-[9px] text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                                value={value}
                                onChange={e => {
                                    const fuelType = e.target.value;
                                    handleSelection("fuelType", fuelType, row);
                                }}
                            >
                                {["Petrol", "Diesel", "CNG", "Electric", "Hybrid"].map(f => (
                                    <option key={f} value={f}>
                                        {f}
                                    </option>
                                ))}
                            </select>
                        )
                    },
                    {
                        Header: "Max Power",
                        accessor: "maxPower",
                        disableSortBy: true
                    },
                    {
                        Header: "Max Torque",
                        accessor: "maxTorque",
                        disableSortBy: true
                    },
                    {
                        Header: "Transmission Type",
                        accessor: "transmission",
                        disableSortBy: true
                    }
                ],
                disableSortBy: true
            },
            {
                Header: "Safety",
                disableSortBy: true,
                columns: [
                    {
                        Header: "NCAP Rating",
                        accessor: "ncap",
                        Cell: ({ row, value }) => (
                            <select
                                className="inline-flex rounded-md border border-gray-300 py-[6px] px-[9px] text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                                value={value}
                                onChange={e => {
                                    const ncap = e.target.value;
                                    handleSelection("ncap", ncap, row);
                                }}
                            >
                                {["Not Rated", "2 ⭐️", "3 ⭐️", "4 ⭐️", "5 ⭐️"].map(s => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        )
                    },
                    {
                        Header: "Air Bags",
                        accessor: "airBags",
                        Cell: ({ row, value }) => (
                            <select
                                className="inline-flex rounded-md border border-gray-300 py-[6px] px-[9px] text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                                value={value}
                                onChange={e => {
                                    const airBags = e.target.value;
                                    handleSelection("airBags", airBags, row);
                                }}
                            >
                                {["2", "4", "6"].map(ab => (
                                    <option key={ab} value={ab}>
                                        {ab}
                                    </option>
                                ))}
                            </select>
                        )
                    },
                    {
                        Header: "Anti-Lock Braking System (ABS)",
                        accessor: "abs",
                        Cell: ({ value, row }) => {
                            return (
                                <div className="text-left">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded-sm border border-gray-300 "
                                        checked={value}
                                        onChange={() => handleCheckbox("abs", value, row)}
                                    />
                                </div>
                            );
                        }
                    },
                    {
                        Header: "Electronic Stability Program (ESP)",
                        accessor: "esp",
                        Cell: ({ value, row }) => {
                            return (
                                <div className="text-left">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded-sm border border-gray-300 "
                                        checked={value}
                                        onChange={() => handleCheckbox("esp", value, row)}
                                    />
                                </div>
                            );
                        }
                    },
                    {
                        Header: "Electronic Brake-force Distribution (EBD)",
                        accessor: "ebd",
                        Cell: ({ value, row }) => {
                            return (
                                <div className="text-left">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded-sm border border-gray-300 "
                                        checked={value}
                                        onChange={() => handleCheckbox("ebd", value, row)}
                                    />
                                </div>
                            );
                        }
                    },
                    {
                        Header: "Hill Hold Control",
                        accessor: "hillHold",
                        Cell: ({ value, row }) => {
                            return (
                                <div className="text-left">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded-sm border border-gray-300 "
                                        checked={value}
                                        onChange={() => handleCheckbox("hillHold", value, row)}
                                    />
                                </div>
                            );
                        }
                    },
                    {
                        Header: "Traction Control System (TC/TCS)",
                        accessor: "tractionControl",
                        Cell: ({ value, row }) => {
                            return (
                                <div className="text-left">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded-sm border border-gray-300 "
                                        checked={value}
                                        onChange={() =>
                                            handleCheckbox("tractionControl", value, row)
                                        }
                                    />
                                </div>
                            );
                        }
                    }
                ]
            },
            {
                Header: "Interior, Comfort & Convenience",
                disableSortBy: true,
                columns: [
                    {
                        Header: "Power Steering",
                        accessor: "powerSteering",
                        Cell: ({ value, row }) => {
                            return (
                                <div className="text-left">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded-sm border border-gray-300 "
                                        checked={value}
                                        onChange={() => handleCheckbox("powerSteering", value, row)}
                                    />
                                </div>
                            );
                        }
                    },
                    {
                        Header: "Air Conditioner",
                        accessor: "ac",
                        Cell: ({ row, value }) => (
                            <select
                                className="inline-flex rounded-md border border-gray-300 py-[6px] px-[9px] text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                                value={value}
                                onChange={e => {
                                    const ac = e.target.value;
                                    handleSelection("ac", ac, row);
                                }}
                            >
                                {["Automatic", "Manual"].map(ac => (
                                    <option key={ac} value={ac}>
                                        {ac}
                                    </option>
                                ))}
                            </select>
                        )
                    },
                    {
                        Header: "Infotainment System",
                        accessor: "infotainment",
                        disableSortBy: true,
                        Cell: ({ value, row }) => {
                            return (
                                <div className="text-left">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded-sm border border-gray-300 "
                                        checked={value}
                                        onChange={() => handleCheckbox("infotainment", value, row)}
                                    />
                                </div>
                            );
                        }
                    },
                    {
                        Header: "Smart Connectivity",
                        accessor: "smartConnectivity",
                        disableSortBy: true,
                        Cell: ({ row, value }) => (
                            <select
                                className="inline-flex rounded-md border border-gray-300 py-[6px] px-[9px] text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                                value={value}
                                onChange={e => {
                                    const connectivity = e.target.value;
                                    handleSelection("smartConnectivity", connectivity, row);
                                }}
                            >
                                {["NA", "Android Auto", "Apple Car Play", "Both"].map(c => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        )
                    },
                    {
                        Header: "Speakers",
                        accessor: "speakers",
                        disableSortBy: true,
                        Cell: ({ row, value }) => (
                            <select
                                className="inline-flex rounded-md border border-gray-300 py-[6px] px-[9px] text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                                value={value}
                                onChange={e => {
                                    const speakers = e.target.value;
                                    handleSelection("speakers", connectspeakersivity, row);
                                }}
                            >
                                {["NA", "2", "4", "6", "8", "10"].map(s => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        )
                    },
                    {
                        Header: "Cruise Control",
                        accessor: "cruiseControl",
                        Cell: ({ value, row }) => {
                            return (
                                <div className="text-left">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded-sm border border-gray-300 "
                                        checked={value}
                                        onChange={() => handleCheckbox("cruiseControl", value, row)}
                                    />
                                </div>
                            );
                        }
                    },
                    {
                        Header: "Engine Start/Stop Button",
                        accessor: "engineButton",
                        Cell: ({ value, row }) => {
                            return (
                                <div className="text-left">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded-sm border border-gray-300 "
                                        checked={value}
                                        onChange={() => handleCheckbox("engineButton", value, row)}
                                    />
                                </div>
                            );
                        }
                    }
                ]
            },
            {
                Header: "Exterior",
                disableSortBy: true,
                columns: [
                    {
                        Header: "Sunroof",
                        accessor: "sunroof",
                        Cell: ({ value, row }) => {
                            return (
                                <div className="text-left">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded-sm border border-gray-300 "
                                        checked={value}
                                        onChange={() => handleCheckbox("sunroof", value, row)}
                                    />
                                </div>
                            );
                        }
                    }
                ]
            },
            {
                Header: "Features",
                disableSortBy: true,
                columns: [
                    {
                        Header: "Camera",
                        accessor: "camera",
                        Cell: ({ row, value }) => (
                            <select
                                className="inline-flex rounded-md border border-gray-300 py-[6px] px-[9px] text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                                value={value}
                                onChange={e => {
                                    const camera = e.target.value;
                                    handleSelection("camera", camera, row);
                                }}
                            >
                                {["NA", "Rear", "360"].map(cam => (
                                    <option key={cam} value={cam}>
                                        {cam}
                                    </option>
                                ))}
                            </select>
                        )
                    }
                ]
            },
            {
                Header: "Dimension & Weight",
                disableSortBy: true,
                columns: [
                    {
                        Header: "Length",
                        accessor: "length"
                    },
                    {
                        Header: "Width",
                        accessor: "width"
                    },
                    {
                        Header: "Height",
                        accessor: "height"
                    },
                    {
                        Header: "Wheel Base",
                        accessor: "wheelBase"
                    },
                    {
                        Header: "Ground Clearance",
                        accessor: "groundClearance"
                    },
                    {
                        Header: "Kerb Weight",
                        accessor: "kerbWeight"
                    }
                ]
            },
            {
                Header: "Capacity",
                disableSortBy: true,
                columns: [
                    {
                        Header: "Boot Space",
                        accessor: "boot"
                    },
                    {
                        Header: "Fuel Tank Capacity",
                        accessor: "fuelTank"
                    }
                ]
            },
            {
                Header: "Manufacturer Warranty",
                disableSortBy: true,
                columns: [
                    {
                        Header: "Warranty (years)",
                        accessor: "warranty"
                    },
                    {
                        Header: "Warranty (Kilometres)",
                        accessor: "warrantyKilometres"
                    }
                ]
            },
            {
                Header: "Actions",
                disableSortBy: true,
                columns: [
                    {
                        Header: "Delete",
                        accessor: "delete",
                        disableSortBy: true,
                        Cell: ({ row }) => (
                            <button
                                onClick={() => {
                                    const updatedData = produce(carData, draft => {
                                        draft.splice(row.index, 1);
                                    });
                                    setCarData(updatedData);
                                    toast.success("Successfully deleted");
                                }}
                            >
                                <TrashIcon
                                    className="h-4 w-4 cursor-pointer text-slate-700 hover:text-slate-500"
                                    title="Delete row"
                                    width={24}
                                    height={24}
                                />
                            </button>
                        )
                    }
                ]
            }
        ],
        [carData, handleCheckbox, handleSelection]
    );

    // Store the initial mock data only once
    useEffect(() => {
        const storedData = window.localStorage.getItem("carData");
        if (!storedData) {
            window.localStorage.setItem("carData", JSON.stringify(initialMock));
        }
    }, []);

    // After data chagnes, we turn the flag back off
    // so that if data actually changes when we're not
    // editing it, the page is reset
    useEffect(() => {
        if (carData?.length) {
            setSkipPageReset(false);
            window.localStorage.setItem("carData", JSON.stringify(carData));
        }
    }, [carData]);

    // Update the local state when the stored data changes
    useEffect(() => {
        const storedData = window.localStorage.getItem("carData");
        if (storedData) {
            setCarData(JSON.parse(storedData));
        }
    }, []);

    useEffect(() => {
        // Pre-process the car data by filtering based on carTypeFilterValue
        const filteredCarData = carTypeFilterValue
            ? carData.filter(cd => cd.type === carTypeFilterValue)
            : carData;

        // Calculate the scores using the filtered car data
        const scores = calculateScores(filteredCarData);

        // Update the bar chart data
        setBarChartData(scores);
    }, [carData, carTypeFilterValue]);

    return (
        <div className="w-full">
            <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-normal text-slate-900 sm:text-7xl">
                Supercharge your car shortlisting with{" "}
                <span className="relative whitespace-nowrap text-[#3290EE]">
                    <SquigglyLines />
                    <span className="relative">Car Table</span>
                </span>
            </h1>
            <p className="mx-auto mt-12 max-w-xl text-lg text-slate-700 leading-7">
                Car Table is the perfect DIY app for first-time car buyers who want to compare
                different car options. With Car Table, you can easily add your shortlisted cars and
                compare them with custom filters, charts, and widgets.
            </p>
            <div className="py-16">
                <Table
                    columns={columns}
                    data={carData}
                    updateTableData={updateTableData}
                    skipPageReset={skipPageReset}
                    setIsModalOpen={setIsModalOpen}
                />
            </div>
            <div className="mx-auto pb-10">
                <div className="mx-auto md:text-center">
                    <h2 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-900 sm:text-6xl">
                        Visualize your car data with{" "}
                        <span className="relative whitespace-nowrap text-[#3290EE]">
                            <SquigglyLines />
                            <span className="relative">Charts</span>
                        </span>
                    </h2>
                    <p className="mx-auto mt-12 max-w-xl text-lg text-slate-700 leading-7">
                        Visualize and analyze key metrics of your shortlisted cars, such as engine
                        scores, safety ratings, interior features, and more.
                    </p>
                    <div className="py-16">
                        <div className="flex gap-x-2 mb-4">
                            <span className="flex items-center font-medium text-slate-800 max-sm:hidden">
                                <FunnelIcon className="mr-[1px]" width={20} height={20} /> Filter:
                            </span>
                            <div>
                                <label className="flex items-baseline gap-x-2">
                                    <select
                                        className="mt-1 inline-flex items-center rounded-md border border-gray-300 bg-white py-[6px] px-[9px] text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                                        name="carType-filter"
                                        id="carType-filter"
                                        value={carTypeFilterValue}
                                        onChange={e => {
                                            setCarTypeFilterValue(e.target.value || undefined);
                                        }}
                                    >
                                        <option value="">Car Type</option>
                                        {carTypes.map((option, i) => (
                                            <option key={i} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>
                        <Card>
                            <Title>Car comparison</Title>
                            <BarChart
                                className="mt-4"
                                data={barChartData}
                                index="category"
                                categories={carData.map(car => car.model)}
                                minValue={0}
                                maxValue={10}
                            />
                        </Card>
                    </div>
                </div>
            </div>
            <Dialog
                inputRef={inputRef}
                show={isModalOpen}
                setIsOpen={setIsModalOpen}
                title="Add Car"
            >
                <div className="sm:flex sm:items-start">
                    <form
                        className="md:[420px] grid w-full grid-cols-1 items-center gap-4"
                        onSubmit={handleAddNewCar}
                    >
                        <label className="block">
                            <span className="block text-sm font-medium text-slate-800">Brand</span>
                            <input
                                className="mt-2 block h-10 w-full appearance-none rounded-md bg-white px-3 text-sm text-slate-800 shadow-sm ring-1 ring-gray-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                type="text"
                                placeholder="Tata"
                                maxLength="20"
                                required
                                autoFocus
                                ref={inputRef}
                                value={modalState.brand}
                                onChange={event =>
                                    setModalState({ ...modalState, brand: event.target.value })
                                }
                            />
                        </label>
                        <div className="grid grid-cols-[50%,50%]">
                            <label className="mr-4 block">
                                <span className="block text-sm font-medium text-slate-800">
                                    Model
                                </span>
                                <input
                                    className="mt-2 block h-10 w-full appearance-none rounded-md bg-white px-3 text-sm text-slate-800 shadow-sm ring-1 ring-gray-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    type="text"
                                    placeholder="Nexon"
                                    maxLength="20"
                                    autoFocus
                                    value={modalState.model}
                                    onChange={event =>
                                        setModalState({ ...modalState, model: event.target.value })
                                    }
                                />
                            </label>
                            <label>
                                <span className="block text-sm font-medium text-slate-800">
                                    Type
                                </span>
                                <select
                                    name="type"
                                    className="mt-2 block h-10 w-full rounded-md bg-white py-2 px-3 pr-8 text-sm text-slate-800 shadow-sm ring-1 ring-gray-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    onChange={event => {
                                        setState({ ...modalState, type: event.target.value });
                                    }}
                                    value={modalState.type}
                                    required
                                >
                                    {[
                                        "SUV",
                                        "Sedan",
                                        "Hatchback",
                                        "Compact SUV",
                                        "Compact Sedan"
                                    ].map(carType => {
                                        return (
                                            <option key={carType} value={carType}>
                                                {carType}
                                            </option>
                                        );
                                    })}
                                </select>
                            </label>
                        </div>
                        <div className="grid grid-cols-[50%,50%]">
                            <label className="block">
                                <span className="block text-sm font-medium text-slate-800">
                                    Price
                                </span>
                                <div className="flex items-center justify-between">
                                    <input
                                        className="mt-2 mr-4 block h-10 w-full appearance-none rounded-md bg-white px-3 text-sm text-slate-800 shadow-sm ring-1 ring-gray-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        type="text"
                                        placeholder="1000000"
                                        value={modalState.price}
                                        onChange={event =>
                                            setModalState({
                                                ...modalState,
                                                price: event.target.value
                                            })
                                        }
                                    />
                                </div>
                            </label>
                            <label className="block">
                                <span className="block text-sm font-medium text-slate-800">
                                    Variant
                                </span>
                                <div className="flex items-center justify-between">
                                    <input
                                        className="mt-2 block h-10 w-full appearance-none rounded-md bg-white p-3 text-sm leading-tight text-slate-800 shadow-sm ring-1 ring-gray-300 placeholder:text-slate-400 focus:outline-none focus:ring-2  focus:ring-gray-900 md:w-full "
                                        type="text"
                                        placeholder="XM Plus (S)"
                                        value={modalState.variant}
                                        onChange={event =>
                                            setModalState({
                                                ...modalState,
                                                variant: event.target.value
                                            })
                                        }
                                    />
                                </div>
                            </label>
                        </div>
                        <button className="mt-0 flex h-[44px] items-center justify-center rounded-md bg-slate-900 py-2.5 px-4 text-white hover:bg-slate-700">
                            Submit
                        </button>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}
