import { useState } from "react";

let listeners: React.Dispatch<React.SetStateAction<boolean>>[] = [];
let isOpenState = false;

export function useSidebar() {
    const [isOpen, setIsOpen] = useState(isOpenState);

    const toggle = () => {
        isOpenState = !isOpenState;
        listeners.forEach((l) => l(isOpenState));
    };

    const close = () => {
        isOpenState = false;
        listeners.forEach((l) => l(false));
    };

    if (!listeners.includes(setIsOpen)) {
        listeners.push(setIsOpen);
    }

    return { isOpen, toggle, close };
}