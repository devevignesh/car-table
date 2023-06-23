import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
    Section
} from "@react-email/components";
import * as React from "react";

const FeedbackEmail = ({ message }) => (
    <Html>
        <Head />
        <Preview>New Feedback Received</Preview>
        <Section style={main}>
            <Container style={container}>
                <Section style={{ marginTop: "20px" }}>
                    <Text style={{ ...h1, marginTop: "20px" }}>Car Table</Text>
                </Section>
                <Text style={{ ...h2, marginTop: "20px" }}>New Feedback</Text>
                <Text style={{ ...text, marginTop: "0px" }}>{message}</Text>
            </Container>
        </Section>
    </Html>
);

export default FeedbackEmail;

const main = {
    backgroundColor: "#ffffff",
    margin: "0 auto"
};

const container = {
    border: "1px solid #eaeaea",
    borderRadius: "5px",
    margin: "40px auto",
    padding: "20px",
    width: "465px"
};

const logo = {
    margin: "0 auto"
};

const h1 = {
    color: "#000",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "24px",
    fontWeight: "normal",
    textAlign: "center",
    margin: "30px 0",
    padding: "0"
};

const h2 = {
    color: "#000",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "20px",
    fontWeight: "normal",
    textAlign: "center",
    margin: "20px 0",
    padding: "0"
};

const text = {
    color: "#000",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
    lineHeight: "24px"
};
