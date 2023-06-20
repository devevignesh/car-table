import Link from "next/link";
import { CurrencyRupeeIcon } from "@heroicons/react/20/solid";
import Image from "next/image";

export default function Header() {
    return (
        <header className="flex w-full mt-3 border-b pb-7 sm:px-4 px-2 gap-2">
            <Link href="/" className="flex items-center space-x-3">
                <Image
                    alt="header text"
                    src="/_static/car.svg"
                    className="sm:w-8 sm:h-8 w-7 h-7"
                    width={25}
                    height={25}
                />
                <h1 className="ml-2 text-2xl font-bold tracking-tight sm:text-4xl text-slate-900">Car Table</h1>
            </Link>
        </header>
    );
}
