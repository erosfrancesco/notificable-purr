import { useEffect, useState } from "react";
import { NotificationHistory, useNotifications } from "../notifications";
import clsx from "clsx";
import { TextSubheading, Text } from "../components/Text";

const NotificationToast = ({ notification }: { notification: NotificationHistory | undefined }) => {
    const { data } = notification || {};
    const { title, body } = data || {};

    console.log('Displaying notification:', title, body);


    return <div className="w-full h-full bg-green text-white p-4 rounded shadow-lg">
        <TextSubheading>{title}</TextSubheading>
        <Text>{body}</Text>
    </div>
}

export const NotificationOverlay = () => {
    const { history, unreadCount, clear } = useNotifications();
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(unreadCount > 0);
        // clear('custom_notification');
    }, [history]);

    return <div className={clsx(
        "absolute w-50 h-10 mb-0 mr-0",
        "z-50",
        show ? "block" : "hidden"
    )}>
        <NotificationToast notification={history[0]} />
    </div>
}