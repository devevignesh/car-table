export default function robots() {
    return {
        rules: { userAgent: "*", allow: "/", disallow: "/private/" },
        sitemap: "https://cartable.in/sitemap.xml"
    };
}
