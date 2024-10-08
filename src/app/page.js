"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Balancer from "react-wrap-balancer";
import { toast } from "react-hot-toast";
import { produce } from "immer";
import { TrashIcon, ArrowPathIcon, PlusIcon } from "@heroicons/react/20/solid";
import { Card, Title, BarChart, Subtitle } from "@tremor/react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import Table, { SelectColumnFilter } from "../components/table";
import Dialog from "../components/dialog";
import SquigglyLines from "../components/squigglyLines";
import { calculateScores } from "@/helpers/calculate-scores";
import useAutoFocus from "./hooks/useAutoFocus";
import Feedback from "../components/feedback";
import compactSUV from "./lib/mock/compactSUV.json";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import AutoCompleteList from "@/components/autocomplete-list";
import { lookupModel, lookupVarintByModel } from "@/lib/lookup";

const initialState = {
    brand: "",
    price: "",
    model: "",
    type: "",
    variant: "",
    engine: "",
    engineType: "",
    cylinder: "3",
    fuelType: "",
    maxPower: "",
    maxTorque: "",
    transmission: "",
    ncap: "Not Rated",
    airBags: "2",
    abs: false,
    ebd: false,
    esp: false,
    hillHold: false,
    tractionControl: false,
    powerSteering: false,
    ac: "Automatic",
    infotainment: false,
    smartConnectivity: "NA",
    cruiseControl: false,
    engineButton: false,
    sunroof: "",
    length: "",
    width: "",
    height: "",
    wheelBase: "",
    groundClearance: "",
    fuelTank: "",
    // kerbWeight: "",
    boot: "",
    warranty: "",
    warrantyKilometres: "",
    camera: "NA"
};

export default function Home() {
    const [carData, setCarData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [skipPageReset, setSkipPageReset] = React.useState(false);
    const [modalState, setModalState] = useState(initialState);
    const [carModel, setCarModel] = useState([]);
    const [carVariant, setCarVariant] = useState([]);
    const [loading, setLoading] = useState(false);
    const [barChartData, setBarChartData] = useState([]);
    const [carTypeFilterValue, setCarTypeFilterValue] = useState("");
    const [autocomplete, setAutocomplete] = useState([]);
    const inputRef = useAutoFocus();
    const carTypes = [...new Set(carData.map(car => car.type))];
    const [currentSegment, setCurrentSegment] = useState("compactSUV");
    // Initialize a variable to keep track of the current segment
    let currentSegmentIndex = 0;
    // Define the segments in the desired order
    const segments = ["compactSUV", "hatchback", "sedan"];

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

    const handleAddNewCar = async event => {
        event.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/fetch-car", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    brand: modalState.brand,
                    model: modalState.model,
                    variant: modalState.variant
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || res.statusText);
            }

            const data = await res.json();

            if (data?.result?.length > 0) {
                const updatedData = produce(carData, draft => {
                    data.result.forEach(item => {
                        draft.push({
                            ...item,
                            brand: modalState.brand,
                            model: modalState.model,
                            variant: modalState.variant
                        });
                    });
                });
                setCarData(updatedData);
                setIsModalOpen(false);
                setModalState(initialState);
                toast.success("Car data updated successfully");
            } else {
                toast.error("We're sorry, something went wrong. Please try again later.");
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error(error.message);
        }
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

    const fetchNextSegmentData = () => {
        const currentSegmentIndex = segments.indexOf(currentSegment);
        const nextSegmentIndex = (currentSegmentIndex + 1) % segments.length;
        const nextSegment = segments[nextSegmentIndex];

        // Dynamically load the car data for the next segment
        const nextSegmentData = require(`./lib/mock/${nextSegment}.json`);

        setCarData(nextSegmentData);
        setCurrentSegment(nextSegment);
    };

    const handleCompareMore = () => {
        fetchNextSegmentData();
    };

    const onLookupModel = ({ brand }) => {
        setCarModel(lookupModel({ brand }));
    };

    const onLookupVariant = ({ brand, model }) => {
        setCarVariant(lookupVarintByModel({ brand, model }));
    };

    const handleCloseDialog = () => {
        setModalState({ ...modalState, brand: "", variant: "", model: "" });
        setCarModel([]);
        setCarVariant([]);
        setIsModalOpen(false);
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
                    }
                    // {
                    //     Header: "Kerb Weight",
                    //     accessor: "kerbWeight"
                    // }
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
            window.localStorage.setItem("carData", JSON.stringify(compactSUV));
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
            <div className="space-x-4">
                <button
                    className="relative items-center inline-flex bg-gray-900 rounded-md text-white font-medium px-4 py-3 sm:mt-10 mt-8 hover:bg-primary/90 transition"
                    onClick={() => setIsModalOpen(true)}
                >
                    Add car
                </button>
                <button
                    className="relative items-center inline-flex rounded-md text-slate-700 border font-medium px-4 py-3 sm:mt-10 mt-8 hover:border-gray-300 hover:bg-gray-50 transition"
                    onClick={handleCompareMore}
                >
                    <span className="mr-2 hidden sm:block">Compare more</span>{" "}
                    <ArrowPathIcon className="relative top-[1px] h-4 w-4" />
                </button>
            </div>
            <div className="py-16">
                <Table
                    columns={columns}
                    data={carData}
                    updateTableData={updateTableData}
                    skipPageReset={skipPageReset}
                />
            </div>
            <div className="mx-auto pb-10">
                <div className="mx-auto md:text-center">
                    <h2 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-900 sm:text-6xl">
                        <span className="relative whitespace-nowrap text-[#3290EE]">
                            <SquigglyLines />
                            <span className="relative">Visualize</span>
                        </span>{" "}
                        your car data with charts
                    </h2>
                    <p className="mx-auto mt-12 max-w-xl text-lg text-slate-700 leading-7">
                        Visualize and analyze key metrics of your shortlisted cars, such as engine
                        scores, safety ratings, interior features, and more.
                    </p>
                    <div className="pt-16">
                        <div className="mb-6 flex h-[48px] sm:h-[34px] w-full sm:mb-4 sm:flex-row sm:items-center justify-between">
                            <div className="flex gap-x-2">
                                <span className="flex items-center font-medium text-slate-800 max-sm:hidden">
                                    <FunnelIcon className="mr-[1px]" width={20} height={20} />{" "}
                                    Filter:
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
                            <div className="flex justify-end">
                                <Feedback />
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
                setIsOpen={handleCloseDialog}
                title="Add Car"
            >
                <div className="sm:flex sm:items-start">
                    <form
                        className="md:[420px] grid w-full grid-cols-1 items-center gap-4"
                        onSubmit={handleAddNewCar}
                    >
                        <label className="block">
                            <span className="block text-sm font-medium text-slate-800">Brand</span>
                            <select
                                id="brand"
                                name="type"
                                className="mt-2 block h-10 w-full rounded-md bg-white py-2 px-3 pr-8 text-sm text-slate-800 shadow-sm ring-1 ring-gray-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                onChange={({ target }) => {
                                    const { value } = target;
                                    if (value.length) {
                                        setModalState({ ...modalState, brand: value, variant: "" });
                                        setCarVariant([]);
                                        onLookupModel({ brand: value });
                                    } else {
                                        setModalState({ ...modalState, brand: "" });
                                    }
                                }}
                                value={modalState.brand}
                                required
                            >
                                <option value="">Select a brand</option>
                                {[
                                    "Maruti",
                                    "Tata",
                                    "Kia",
                                    "Toyota",
                                    "Hyundai",
                                    "Mahindra",
                                    "Honda",
                                    "MG",
                                    "Skoda",
                                    "Jeep",
                                    "Renault",
                                    "Nissan",
                                    "Volkswagen",
                                    "Citroen"
                                ].map(brand => {
                                    return (
                                        <option key={brand} value={brand}>
                                            {brand}
                                        </option>
                                    );
                                })}
                            </select>
                        </label>
                        <div className="grid">
                            <label className="block">
                                <span className="block text-sm font-medium text-slate-800">
                                    Model
                                </span>
                                <select
                                    id="model"
                                    name="type"
                                    className="mt-2 block h-10 w-full rounded-md bg-white py-2 px-3 pr-8 text-sm text-slate-800 shadow-sm ring-1 ring-gray-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    onChange={({ target }) => {
                                        const { value } = target;
                                        if (value.length) {
                                            setModalState({ ...modalState, model: value });
                                            onLookupVariant({
                                                brand: modalState.brand,
                                                model: value
                                            });
                                        } else {
                                            setModalState({ ...modalState, model: "" });
                                        }
                                    }}
                                    value={modalState.model}
                                    required
                                    disabled={carModel?.length === 0}
                                >
                                    <option value="">Select a model</option>
                                    {carModel?.map(model => {
                                        return (
                                            <option key={model} value={model}>
                                                {model}
                                            </option>
                                        );
                                    })}
                                </select>
                            </label>
                        </div>
                        <div className="grid">
                            <label className="block">
                                <span className="block text-sm font-medium text-slate-800">
                                    Variant
                                </span>
                                <select
                                    id="variant"
                                    name="type"
                                    className="mt-2 block h-10 w-full rounded-md bg-white py-2 px-3 pr-8 text-sm text-slate-800 shadow-sm ring-1 ring-gray-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    onChange={event => {
                                        setModalState({
                                            ...modalState,
                                            variant: event.target.value
                                        });
                                    }}
                                    value={modalState.variant}
                                    required
                                    disabled={carVariant?.length === 0}
                                >
                                    <option value="">Select a variant</option>
                                    {carVariant?.map(variant => {
                                        return (
                                            <option key={variant} value={variant}>
                                                {variant}
                                            </option>
                                        );
                                    })}
                                </select>
                            </label>
                        </div>
                        <Button disabled={loading}>
                            {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Please wait" : "Submit"}
                        </Button>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}
