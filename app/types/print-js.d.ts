declare module 'print-js' {
    function printJS(options: {
        printable: string;
        type?: string;
        header?: string;
        showModal?: boolean;
        modalMessage?: string;
        onPrintDialogClose?: () => void;
        [key: string]: any;
    }): void;

    function printJS(printable: string, type?: string): void;

    export default printJS;
}
