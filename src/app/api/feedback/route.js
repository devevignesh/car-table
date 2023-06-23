import FeedbackEmail from "../../../components/feedbackEmail";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const sentFromEmailId = "Vignesh from CarTable.in <hello@cartable.in>";

export async function POST(req, res) {
    const { message } = await req.json();
    try {
        const data = await resend.emails.send({
            from: sentFromEmailId,
            subject: "🎉 New Feedback Received",
            to: "vigneshe1992@gmail.com",
            react: FeedbackEmail({ message })
        });
        return NextResponse.json({ message: "Feedback received." });
    } catch (error) {
        return NextResponse.json({ message: "Failed." });
    }
}
