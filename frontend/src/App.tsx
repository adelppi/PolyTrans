import Home from "./view/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./view/NotFound";
import { Box } from "@chakra-ui/react";

function App() {
    return (
        <Box h="100vh" bg="gray.200">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/Home" element={<Home />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </Box>
    );
}

export default App;
