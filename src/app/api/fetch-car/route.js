import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import { properties } from "@/lib/selectors";

export async function POST(req, res) {
    const { brand, model, variant, fuelType } = await req.json();
    // const URL = "https://www.cardekho.com/overview/Tata_Nexon/Tata_Nexon_Creative.htm";
    const URL =
        `https://www.cardekho.com/overview/${brand}_${model}/${brand}_${model}_${variant}` +
        (fuelType === "petrol" ? `_${fuelType}` : "") +
        `.htm`;

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on("request", request => {
            const reqType = request.resourceType();
            if (reqType === "document") {
                request.continue();
            } else if (process.env.NODE_ENV === "development") {
                request.continue();
            } else {
                console.log("block request type: " + request.resourceType());
                request.abort();
            }
        });

        await page.goto(URL);

        const html =
            process.env.NODE_ENV === "development"
                ? await page.content()
                : await page.evaluate(() => {
                      return document.querySelector("body").innerHTML;
                  });

        await browser.close();

        const $ = cheerio.load(html);

        // Initialize a single object to store all properties
        let result = {};

        properties.forEach(property => {
            if (property.type === "icon") {
                // For icon-based properties, check the presence of specific classes
                const iconExists = $(property.selector).hasClass("icon-check");
                const iconNotExists = $(property.selector).hasClass("icon-deletearrow");
                // Convert the presence of the icon to a boolean value
                result[property.name] = iconExists ? true : iconNotExists ? false : null;
            } else {
                // For text-based properties, get the text and clean it up
                result[property.name] = $(property.selector)
                    .text()
                    .replace(/\r?\n|\r/g, "")
                    .trim();
            }
        });

        // Convert certain properties to boolean values if needed
        const booleanProperties = ["abs", "ac", "powerSteering", "engineButton"];
        booleanProperties.forEach(prop => {
            if (result[prop]) {
                result[prop] = result[prop] === "Yes";
            }
        });

        // Handle specific property transformations
        if (result.camera) {
            if (result.camera === "With Guidedlines") {
                result.camera = "Rear";
            } else if (result["360_camera"] === true) {
                result.camera = "360";
            } else {
                result.camera = "NA";
            }
        }

        if (result.ncap === "") {
            result.ncap = "Not Rated";
        }

        return NextResponse.json({ message: "Success.", result: [result] });
    } catch (error) {
        return NextResponse.json({ message: "Failed." });
    }
}
