// Copied from https://github.com/hoodie/notify-rust/blob/main/src/notification.rs

#[cfg(all(unix, not(target_os = "macos")))]

/// Desktop notification.
///
/// A desktop notification is configured via builder pattern, before it is launched with `show()`.
///
/// # Example
/// ``` no_run
/// # use notify_rust::*;
/// # fn _doc() -> Result<(), Box<dyn std::error::Error>> {
///     Notification::new()
///         .summary("☝️ A notification")
///         .show()?;
/// # Ok(())
/// # }
/// ```
/// 
/// 


use crate::timeout::Timeout;


#[derive(Debug, Clone)]
#[non_exhaustive]
pub struct Notification {
    /// Single line to summarize the content.
    pub summary: String,

    /// Subtitle for macOS
    pub subtitle: Option<String>,

    /// Multiple lines possible, may support simple markup,
    /// check out `get_capabilities()` -> `body-markup` and `body-hyperlinks`.
    pub body: String,

    /// Lifetime of the Notification in ms. Often not respected by server, sorry.
    pub timeout: Timeout, // both gnome and galago want allow for -1

    /// Only to be used on the receive end. Use Notification hand for updating.
    pub(crate) id: Option<u32>,
}

impl Notification {
    /// Constructs a new Notification.
    ///
    /// Most fields are empty by default, only `appname` is initialized with the name of the current
    /// executable.
    /// The appname is used by some desktop environments to group notifications.
    pub fn new() -> Notification {
        Notification::default()
    }

    /// Set the `summary`.
    ///
    /// Often acts as title of the notification. For more elaborate content use the `body` field.
    pub fn summary(&mut self, summary: &str) -> &mut Notification {
        summary.clone_into(&mut self.summary);
        self
    }

    /// Set the `subtitle`.
    ///
    /// This is only useful on macOS, it's not part of the XDG specification and will therefore be eaten by gremlins under your CPU 😈🤘.
    pub fn subtitle(&mut self, subtitle: &str) -> &mut Notification {
        self.subtitle = Some(subtitle.to_owned());
        self
    }

    /// Set the content of the `body` field.
    ///
    /// Multiline textual content of the notification.
    /// Each line should be treated as a paragraph.
    /// Simple html markup should be supported, depending on the server implementation.
    pub fn body(&mut self, body: &str) -> &mut Notification {
        body.clone_into(&mut self.body);
        self
    }

    /// Set the `timeout`.
    ///
    /// Accepts multiple types that implement `Into<Timeout>`.
    ///
    /// ## `i31`
    ///
    /// This sets the time (in milliseconds) from the time the notification is displayed until it is
    /// closed again by the Notification Server.
    /// According to [specification](https://developer.gnome.org/notification-spec/)
    /// -1 will leave the timeout to be set by the server and
    /// 0 will cause the notification never to expire.
    /// ## [Duration](`std::time::Duration`)
    ///
    /// When passing a [`Duration`](`std::time::Duration`) we will try convert it into milliseconds.
    ///
    ///
    /// ```
    /// # use std::time::Duration;
    /// # use notify_rust::Timeout;
    /// assert_eq!(Timeout::from(Duration::from_millis(2000)), Timeout::Milliseconds(2000));
    /// ```
    /// ### Caveats!
    ///
    /// 1. If the duration is zero milliseconds then the original behavior will apply and the notification will **Never** timeout.
    /// 2. Should the number of milliseconds not fit within an [`i32`] then we will fall back to the default timeout.
    /// ```
    /// # use std::time::Duration;
    /// # use notify_rust::Timeout;
    /// assert_eq!(Timeout::from(Duration::from_millis(0)), Timeout::Never);
    /// assert_eq!(Timeout::from(Duration::from_millis(u64::MAX)), Timeout::Default);
    /// ```
    ///
    /// # Platform support
    /// This only works on XDG Desktops, macOS does not support manually setting the timeout.
    pub fn timeout<T: Into<Timeout>>(&mut self, timeout: T) -> &mut Notification {
        self.timeout = timeout.into();
        self
    }


    /// Set an Id ahead of time
    ///
    /// Setting the id ahead of time allows overriding a known other notification.
    /// Though if you want to update a notification, it is easier to use the `update()` method of
    /// the `NotificationHandle` object that `show()` returns.
    ///
    /// (xdg only)
    pub fn id(&mut self, id: u32) -> &mut Notification {
        self.id = Some(id);
        self
    }

    /// Finalizes a Notification.
    ///
    /// Part of the builder pattern, returns a complete copy of the built notification.
    pub fn finalize(&self) -> Notification {
        self.clone()
    }


    #[cfg(target_os = "linux")]
    pub fn show(&self) -> Notification {
        self.clone()
    }

    /// Sends Notification to `NSUserNotificationCenter`.
    ///
    /// Returns an `Ok` no matter what, since there is currently no way of telling the success of
    /// the notification.
    #[cfg(target_os = "macos")]
    pub fn show(&self) -> Result<macos::NotificationHandle> {
        macos::show_notification(self)
    }

    /// Sends Notification to `NSUserNotificationCenter`.
    ///
    /// Returns an `Ok` no matter what, since there is currently no way of telling the success of
    /// the notification.
    #[cfg(target_os = "windows")]
    pub fn show(&self) -> Result<()> {
        windows::show_notification(self)
    }
}

impl Default for Notification {
    fn default() -> Notification {
        Notification {
            summary: String::new(),
            subtitle: None,
            body: String::new(),
            timeout: Timeout::Default,
            id: None,
        }
    }
}
