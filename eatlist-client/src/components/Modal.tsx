import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "../style/modal.css";
import "../style/global-assets.css";

interface ModalProps {
    children: React.ReactNode;
}

const Modal = ({ children }: ModalProps) => {
    const navigate = useNavigate();

    // Close modal by going back in history
    const handleClose = () => navigate(-1);

    return createPortal(
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={handleClose}>
                    <i className="fa-solid fa-x"></i>
                </button>
                {children}
            </div>
        </div>,
        document.getElementById("modal-root") as HTMLElement
    );
};

export default Modal;