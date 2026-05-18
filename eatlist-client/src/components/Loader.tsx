import { FunctionComponent } from "react";

interface LoaderProps {}

const Loader: FunctionComponent<LoaderProps> = () => {
    return (
            <div className="loader-container">
                <div className="loader"></div>
            </div>
    );
};

export default Loader;