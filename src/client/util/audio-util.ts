function volumePercentageToDb(percentage: number): number {
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    return clampedPercentage === 0 ? -Infinity : 20 * Math.log10(clampedPercentage / 100);
}

export { volumePercentageToDb };
