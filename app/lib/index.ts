export const formatDate = (value: any) => {
    if (!value) {
        return '-';
    }
    const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    const date = new Date(value);
    return `${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()} ${monthNames[date.getMonth()]
        } ${date.getFullYear()}`;
};