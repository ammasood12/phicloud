// ===============================
// PROXY CONFIG
// ===============================

const GH_PROXY_PREFIX = 'https://gh-proxy.org/';

// ===============================
// ENVIRONMENT DETECTION
// ===============================

// Hosts that serve the static GitHub Pages mirror.
const GITHUB_PAGES_HOSTS = [
    'guide.phihub.shop',
    'www.guide.phihub.shop',
];

// True when running on GitHub Pages (static, no PHP).
const IS_GITHUB_PAGES =
    GITHUB_PAGES_HOSTS.includes(location.hostname) ||
    /\.github\.io$/i.test(location.hostname);

// The aapanel site — source of truth for version data.
const PRODUCTION_ORIGIN = 'https://guide.phicloud.xyz';

// ===============================
// VERSION DATA STORE
// ===============================

let APP_VERSIONS      = {};
let APP_RELEASE_DATES = {};

// ===============================
// INLINE FALLBACK
// Hardcoded last-resort data — used only if every remote/local
// source fails. Update these when you bump major versions.
// ===============================

const FALLBACK_APP_VERSIONS = {
    // Android / Desktop (GitHub releases)
    "hiddify":    "4.1.1",
    "clashmi":    "1.0.30.1605",
    "flclash":    "0.8.98",
    "clashmeta":  "2.11.34",
    "clashverge": "2.5.5",
    "tiktok2":    "46.4.3",
    // iOS (App Store)
    "hiddify_ios":      "4.0",
    "clashmi_ios":      "1.0.29.1503",
    "shadowrocket_ios": "2.2.92",
};

const FALLBACK_APP_RELEASE_DATES = {
    "hiddify":    "2026-03-06",
    "clashmi":    "2026-09-22",
    "flclash":    "2026-09-14",
    "clashmeta":  "2026-09-14",
    "clashverge": "2026-09-22",
    "tiktok2":    "2026-08-10",
    "hiddify_ios":      "2026-09-24",
    "clashmi_ios":      "2026-09-24",
    "shadowrocket_ios": "2026-09-24",
};

// ===============================
// HELPERS
// ===============================

/**
 * Fetch a URL and parse it as JSON.
 * Throws if the response isn't OK, or if the body isn't valid JSON
 * (e.g. GitHub Pages serving raw PHP source as text).
 */
function fetchJson(url) {
    return fetch(url).then(res => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
        return res.json();
    });
}

/**
 * Build the ordered list of version sources to try, based on environment.
 *
 * Production (aapanel, has PHP):
 *   1. /versions.php          → live PHP, always freshest
 *   2. /app_versions.json     → static cache written by versions.php
 *
 * GitHub Pages (static, no PHP):
 *   1. <prod>/app_versions.json → fetch from aapanel (needs CORS)
 *   2. /app_versions.json       → local copy committed to the repo
 *
 * Note: versions.php is intentionally omitted on GitHub Pages —
 * GitHub cannot execute PHP, so it would always return raw source.
 */
function buildSources() {
    const base = IS_GITHUB_PAGES ? PRODUCTION_ORIGIN : '';

    if (IS_GITHUB_PAGES) {
        return [
            { url: `${base}/app_versions.json`, label: 'Production: static JSON' },
            { url: `/app_versions.json`,        label: 'GitHub: local JSON' },
        ];
    }

    return [
        { url: `/versions.php`,        label: 'Production: live PHP' },
        { url: `/app_versions.json`,   label: 'Production: static JSON' },
    ];
}

// ===============================
// LOAD VERSIONS (cascade)
// ===============================

/**
 * Try each source in order until one returns valid JSON.
 * On total failure, fall back to hardcoded defaults so the
 * page still renders usable data.
 */
function loadVersions() {
    const envLabel = IS_GITHUB_PAGES ? 'GitHub Pages' : 'Production';
    const sources  = buildSources();

    // ---------- Startup banner ----------
    console.groupCollapsed(`[versions] Loading on ${envLabel} (${location.hostname})`);
    console.log('Cascade order:');
    sources.forEach((s, i) => console.log(`  ${i + 1}. ${s.label}  →  ${s.url}`));
    console.groupEnd();

    // ---------- Try each source sequentially ----------
    return sources
        .reduce(
            (chain, src) => chain.catch(prevErr => {
                console.warn(`[versions] ✗ ${src.label} failed — ${prevErr.message}`);
                console.log (`[versions]   → trying next: ${src.label}`);
                return fetchJson(src.url).then(data => {
                    data.__source = src;
                    return data;
                });
            }),
            // Kick off the chain with the first source.
            fetchJson(sources[0].url).then(data => {
                data.__source = sources[0];
                return data;
            })
        )

        // ---------- Success ----------
        .then(data => {
            const src = data.__source;
            delete data.__source;

            console.log(`[versions] ✓ Loaded from: ${src.label}`);
            // console.log(`[versions]   URL:          ${src.url}`);
            console.log(`[versions]   Last updated: ${data.last_update_readable || '(unknown)'}`);

            APP_VERSIONS      = data.versions      || {};
            APP_RELEASE_DATES = data.release_dates || {};

            console.log('[versions]   APP_VERSIONS:',      APP_VERSIONS);
            console.log('[versions]   APP_RELEASE_DATES:', APP_RELEASE_DATES);

            // Expose the source for debugging / UI badges.
            window.__VERSIONS_SOURCE__ = src.label;
        })

        // ---------- Total failure → inline fallback ----------
        .catch(err => {
            console.error(`[versions] ✗ All sources failed. Last error: ${err.message}`);
            console.warn ('[versions] ⚠ Falling back to hardcoded defaults.');

            APP_VERSIONS      = FALLBACK_APP_VERSIONS;
            APP_RELEASE_DATES = FALLBACK_APP_RELEASE_DATES;

            console.warn('[versions]   APP_VERSIONS:', APP_VERSIONS);

            window.__VERSIONS_SOURCE__ = 'INLINE FALLBACK';
        });
}

// ===============================
// GET VERSION (with device type)
// ===============================

function getAppVersion(appName, deviceType) {
    // For iOS apps, use the _ios suffix
    if (deviceType === 'ios') {
        const iosKey = appName + '_ios';
        return APP_VERSIONS[iosKey] || APP_VERSIONS[appName] || '';
    }
    if (appName === 'flclash_mac') {
        return '0.8.92'; // Hardcoded version for flclash_mac
    }
    // For Android/Windows/Mac/Linux, use the base name
    return APP_VERSIONS[appName] || '';
}

// ===============================
// GET RELEASE DATE (with device type)
// ===============================

function getReleaseDate(appName, deviceType) {
    // For iOS apps, use the _ios suffix
    if (deviceType === 'ios') {
        const iosKey = appName + '_ios';
        return APP_RELEASE_DATES[iosKey] || APP_RELEASE_DATES[appName] || '';
    }
    if (appName === 'flclash_mac') {
        return '2026-06-20'; // Hardcoded release date for flclash_mac
    }
    return APP_RELEASE_DATES[appName] || '';
}

// ===============================
// WEBSITE LINKS
// ===============================

const websiteLinks = {
    clashmi: {
        default: 'https://github.com/KaringX/clashmi/releases/latest'
    },
    shadowrocket: {
        default: 'https://apps.apple.com/app/shadowrocket/id932747118'
    },
    flclash: {
        default: 'https://github.com/chen08209/FlClash/releases/latest'
    },
    clashmeta: {
        default: 'https://github.com/MetaCubeX/ClashMetaForAndroid/releases/latest'
    },
    clashverge: {
        default: 'https://github.com/clash-verge-rev/clash-verge-rev/releases/latest'
    },
    hiddify: {
        default: 'https://github.com/hiddify/hiddify-app/releases/latest'
    },
    tiktok: {
        default: 'https://apkw.ru/en/download/tik-tok-mod/#downloadblock'
    },
    tiktok2: {
        default: 'https://github.com/namecallfilter/tiktokmodcloud/releases/latest'
    },
    apkpure: {
        default: 'https://apkpure.com/'
    },
    todesk: {
        default: 'https://www.todesk.com/download.html'
    }
};

// ===============================
// DOWNLOAD LINKS (DYNAMIC)
// ===============================

const downloadLinks = {
    clashmi: {
        android: {
            default: () =>
                `https://github.com/KaringX/clashmi/releases/download/v${getAppVersion('clashmi', 'android')}/clashmi_${getAppVersion('clashmi', 'android')}_android_arm64-v8a.apk`
        },
        ios: {
            default: 'https://apps.apple.com/app/clash-mi/id6744321968'
        }
    },

    shadowrocket: {
        ios: {
            default: 'https://apps.apple.com/app/shadowrocket/id932747118'
        }
    },

    flclash: {
        android: {
            default: () =>
                `https://github.com/chen08209/FlClash/releases/download/v${getAppVersion('flclash', 'android')}/FlClash-${getAppVersion('flclash', 'android')}-android-arm64-v8a.apk`
        },
        windows: {
            default: () =>
                `https://github.com/chen08209/FlClash/releases/download/v${getAppVersion('flclash', 'windows')}/FlClash-${getAppVersion('flclash', 'windows')}-windows-amd64.exe`
        },
        mac: {
            apple: () =>
                `https://github.com/chen08209/FlClash/releases/download/v${getAppVersion('flclash', 'mac')}/FlClash-${getAppVersion('flclash', 'mac')}-macos-arm64.dmg`,
            intel: () =>
                `https://github.com/chen08209/FlClash/releases/download/v${getAppVersion('flclash', 'mac')}/FlClash-${getAppVersion('flclash', 'mac')}-macos-amd64.dmg`,
            default: () =>
                `https://github.com/chen08209/FlClash/releases/download/v${getAppVersion('flclash', 'mac')}/FlClash-${getAppVersion('flclash', 'mac')}-macos-amd64.dmg`
        },
        linux: {
            default: () =>
                `https://github.com/chen08209/FlClash/releases/download/v${getAppVersion('flclash', 'linux')}/FlClash-${getAppVersion('flclash', 'linux')}-linux-amd64.deb`
        }
    },

    flclash_mac: {
        mac: {
            apple: () =>
                `https://github.com/chen08209/FlClash/releases/download/v${getAppVersion('flclash_mac', 'mac')}/FlClash-${getAppVersion('flclash_mac', 'mac')}-macos-arm64.dmg`,
            intel: () =>
                `https://github.com/chen08209/FlClash/releases/download/v${getAppVersion('flclash_mac', 'mac')}/FlClash-${getAppVersion('flclash_mac', 'mac')}-macos-amd64.dmg`,
            default: () =>
                `https://github.com/chen08209/FlClash/releases/download/v${getAppVersion('flclash_mac', 'mac')}/FlClash-${getAppVersion('flclash_mac', 'mac')}-macos-amd64.dmg`
        }
    },

    clashmeta: {
        android: {
            default: () =>
                `https://github.com/MetaCubeX/ClashMetaForAndroid/releases/download/v${getAppVersion('clashmeta', 'android')}/cmfa-${getAppVersion('clashmeta', 'android')}-meta-arm64-v8a-release.apk`
        }
    },

    clashverge: {
        windows: {
            default: () =>
                `https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v${getAppVersion('clashverge', 'windows')}/Clash.Verge_${getAppVersion('clashverge', 'windows')}_x64-setup.exe`
        },
        mac: {
            apple: () =>
                `https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v${getAppVersion('clashverge', 'mac')}/Clash.Verge_${getAppVersion('clashverge', 'mac')}_aarch64.dmg`,
            intel: () =>
                `https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v${getAppVersion('clashverge', 'mac')}/Clash.Verge_${getAppVersion('clashverge', 'mac')}_x64.dmg`,
            default: () =>
                `https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v${getAppVersion('clashverge', 'mac')}/Clash.Verge_${getAppVersion('clashverge', 'mac')}_x64.dmg`
        },
        linux: {
            default: () =>
                `https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v${getAppVersion('clashverge', 'linux')}/Clash.Verge_${getAppVersion('clashverge', 'linux')}_amd64.deb`
        }
    },

    hiddify: {
        android: {
            default: () =>
                `https://github.com/hiddify/hiddify-app/releases/download/v${getAppVersion('hiddify', 'android')}/Hiddify-Android-arm64.apk`
        },
        ios: {
            default: 'https://apps.apple.com/app/hiddify-proxy-vpn/id6596777532'
        },
        windows: {
            default: () =>
                `https://github.com/hiddify/hiddify-app/releases/download/v${getAppVersion('hiddify', 'windows')}/Hiddify-Windows-Setup-x64.exe`
        },
        mac: {
            default: () =>
                `https://github.com/hiddify/hiddify-app/releases/download/v${getAppVersion('hiddify', 'mac')}/Hiddify-MacOS.dmg`
        },
        linux: {
            default: () =>
                `https://github.com/hiddify/hiddify-app/releases/download/v${getAppVersion('hiddify', 'linux')}/Hiddify-Linux-x64.AppImage`
        }
    },

    tiktok: {
        other: {
            default: 'https://fylio.com/d/2d97b162-9797-43fc-bca7-684b5074f848'
        }
    },

    tiktok2: {
        other: {
            default: () => 
                `https://github.com/namecallfilter/tiktokmodcloud/releases/latest`
        },
        extra: {
            default: () => 
                `https://github.com/namecallfilter/tiktokmodcloud/releases/download/v${getAppVersion('tiktok2', 'android')}-mod-fix/${getAppVersion('tiktok2', 'android')}_universal_fix.apk`
        }
    },

    apkpure: {
        other: {
            default: 'https://d.apkpure.com/custom/com.apkpure.aegon-latest.apk'
        }
    },

    todesk: {
        other: {
            windows: 'https://dl.todesk.com/irrigation/ToDesk_5.1.2.0.exe',
            mac: 'https://dl.todesk.com/macos/ToDesk_5.1.2.0.pkg'
        }
    }
};

// ===============================
// GET DOWNLOAD LINK (SYNC)
// ===============================

function getDownloadLink(appName, deviceType, version = 'default', proxy = false) {
    try {
        if (version === 'proxy' || typeof version === 'boolean') {
            proxy = version;
            version = 'default';
        }

        const appLinks = downloadLinks[appName];
        if (!appLinks) return '#';

        const deviceLinks = appLinks[deviceType];
        if (!deviceLinks) return '#';

        const link = deviceLinks[version] || deviceLinks.default;
        let url = typeof link === 'function' ? link() : link || '#';

        if (url === '#') return '#';

        const isProxyRequested = proxy === 'proxy' || proxy === true || proxy === 'true';

        if (isProxyRequested) {
            return url.startsWith(GH_PROXY_PREFIX) ? url : GH_PROXY_PREFIX + url;
        }

        return url;

    } catch (error) {
        console.error('Error getting download link:', error);
        return '#';
    }
}

// ===============================
// GET WEBSITE LINK
// ===============================

function getWebsiteLink(appName, version = 'default') {
    try {
        const appLinks = websiteLinks[appName];
        if (!appLinks) return '#';

        const link = appLinks[version] || appLinks.default;

        return typeof link === 'function' ? link() : link || '#';

    } catch (error) {
        console.error('Error getting website link:', error);
        return '#';
    }
}