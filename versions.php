<?php

header('Content-Type: application/json');

$cacheFile = __DIR__ . '/app_versions.json';
$interval = 86400;
// 12 hours -> 43200 seconds, 24 hours -> 86400 seconds

// GitHub repos (Android/Windows/Mac/Linux versions)
$githubRepos = [
    "hiddify" => "hiddify/hiddify-app",
    "clashmi" => "KaringX/clashmi",
    "flclash" => "chen08209/FlClash",
    "clashmeta" => "MetaCubeX/ClashMetaForAndroid",
    "clashverge" => "clash-verge-rev/clash-verge-rev",
    "tiktok2" => "namecallfilter/tiktokmodcloud"
];

// App Store IDs (iOS versions only)
$appStoreApps = [
    "hiddify" => "6596777532",     // Hiddify iOS
    "clashmi" => "6744321968",     // Clash Mi iOS
    "shadowrocket" => "932747118",  // Shadowrocket iOS
];

$now = time();
$cachedData = [];

// Load existing cache
if (file_exists($cacheFile)) {
    $cachedData = json_decode(file_get_contents($cacheFile), true);
}

$lastUpdate = isset($cachedData['last_update']) ? $cachedData['last_update'] : 0;

// ===============================
// UPDATE IF NEEDED
// ===============================

if (!file_exists($cacheFile) || ($now - $lastUpdate) > $interval) {

    $versions = [];
    $releaseDates = [];

    // Fetch from GitHub repos (Android/Desktop versions)
    foreach ($githubRepos as $app => $repo) {
        $url = "https://api.github.com/repos/$repo/releases/latest";

        $opts = [
            "http" => [
                "header" => "User-Agent: PHP\r\n"
            ]
        ];

        $context = stream_context_create($opts);
        $res = @file_get_contents($url, false, $context);

        if ($res) {
            $data = json_decode($res, true);
            if (isset($data['tag_name'])) {
                $versions[$app] = preg_replace('/^v/', '', $data['tag_name']);
                if (isset($data['published_at'])) {
                    $releaseDates[$app] = date('Y-m-d', strtotime($data['published_at']));
                }
            }
        }
    }

    // Fetch iOS versions from App Store (overwrite for iOS apps)
    foreach ($appStoreApps as $app => $appId) {
        $iosVersion = getAppStoreVersion($appId);
        if ($iosVersion) {
            $versions[$app . '_ios'] = $iosVersion;
            $releaseDates[$app . '_ios'] = date('Y-m-d'); // App Store doesn't provide publish date
        }
    }

    // Save if valid
    if (!empty($versions)) {
        $newData = [
            "last_update" => $now,
            "last_update_readable" => date('Y-m-d H:i:s'),
            "versions" => $versions,
            "release_dates" => $releaseDates
        ];

        file_put_contents($cacheFile, json_encode($newData, JSON_PRETTY_PRINT));
        echo json_encode($newData);
        exit;
    }
}

// ===============================
// RETURN EXISTING CACHE
// ===============================

if (!empty($cachedData)) {
    if (!isset($cachedData['release_dates'])) {
        $cachedData['release_dates'] = [];
    }
    echo json_encode($cachedData);
} else {
    echo json_encode([
        "last_update" => 0,
        "versions" => [],
        "release_dates" => []
    ]);
}

// ===============================
// FUNCTION: Get App Store Version
// ===============================

function getAppStoreVersion($appId) {
    // Use iTunes API (most reliable)
    $url = "https://itunes.apple.com/lookup?id=" . $appId;
    
    $opts = [
        "http" => [
            "header" => "User-Agent: PHP\r\n",
            "timeout" => 10
        ]
    ];
    
    $context = stream_context_create($opts);
    $res = @file_get_contents($url, false, $context);
    
    if ($res) {
        $data = json_decode($res, true);
        if (isset($data['results'][0]['version'])) {
            return $data['results'][0]['version'];
        }
    }
    
    return null;
}
?>