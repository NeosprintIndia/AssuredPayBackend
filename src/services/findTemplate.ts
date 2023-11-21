import  AlertsTemplateDB from '../models/NotificationTemplate'
export const findAlertsTemplate = async (slug: string): Promise<any> => {
    try {
        const succ = await AlertsTemplateDB.findOne({ SLUG: slug }).exec();
        if (succ) {
            return { code: 200, message: "Template found", data: succ };
        } else {
            return { code: 404, message: "Template not found!" };
        }
    } catch (err) {
        console.error(err, "err");
        return { code: 500, message: 'Internal Server Error', error: err };
    }
};