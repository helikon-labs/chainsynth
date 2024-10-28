function truncate(fullStr: string, strLen = 10, separator = '...', frontChars = 10, backChars = 8) {
    if (fullStr.length <= strLen) return fullStr;
    return (
        fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars)
    );
}

export { truncate };
