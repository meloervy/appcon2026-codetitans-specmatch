import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useState } from 'react';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '56',
    placement = 'bottom',
    contentClasses = 'py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800',
    children,
}) => {
    const { open, setOpen } = useContext(DropDownContext);

    const isTop = placement === 'top' || align.startsWith('top');

    let alignmentClasses = isTop ? 'origin-bottom' : 'origin-top';
    let positionClasses = isTop ? 'bottom-full mb-2' : 'mt-2';

    if (align === 'left' || align === 'top-left') {
        alignmentClasses = isTop
            ? 'ltr:origin-bottom-left rtl:origin-bottom-right start-0'
            : 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right' || align === 'top-right') {
        alignmentClasses = isTop
            ? 'ltr:origin-bottom-right rtl:origin-bottom-left end-0'
            : 'ltr:origin-top-right rtl:origin-top-left end-0';
    } else if (align === 'top' || align === 'center') {
        alignmentClasses = isTop ? 'origin-bottom start-0 end-0' : 'origin-top start-0 end-0';
    }

    let widthClasses = 'w-56';

    if (width === '48') {
        widthClasses = 'w-48';
    } else if (width === '64') {
        widthClasses = 'w-64';
    } else if (width === 'full') {
        widthClasses = 'w-full';
    }

    return (
        <>
            <Transition
                show={open}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={`absolute z-50 ${positionClasses} rounded-xl shadow-xl ${alignmentClasses} ${widthClasses}`}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className={
                            `rounded-xl shadow-sm overflow-hidden ` +
                            contentClasses
                        }
                    >
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-xs font-medium leading-5 text-slate-700 dark:text-zinc-200 transition duration-150 ease-in-out hover:bg-slate-50 dark:hover:bg-zinc-800/70 focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
