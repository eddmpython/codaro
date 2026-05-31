fn main() {
    if std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default() == "windows" {
        let mut res = winresource::WindowsResource::new();
        res.set_icon("assets/codaro.ico");
        res.set("ProductName", "Codaro");
        res.set("FileDescription", "Codaro Desktop Launcher");
        res.set("CompanyName", "eddmpython");
        res.compile()
            .expect("Failed to compile Windows resources");
    }
}
