/**
 * Path Parser & Auto-Date Resolver for One Tap & AnyShare
 * 
 * Automatically detects Safar campaigns from workstation folder paths,
 * and automatically injects/appends the production date folder if not added by the user.
 */

const KNOWN_CITIES = [
  'Colombo', 'Mumbai', 'Karachi', 'Dar es Salaam', 'Dubai', 'Nairobi',
  'Houston', 'London', 'Indore', 'Pune', 'Surat', 'Burhanpur',
  'Jamnagar', 'Ahmedabad', 'Sidhpur', 'Dahod', 'Godhra', 'Kuwait',
  'Bahrain', 'Mombasa', 'Sharjah', 'Doha', 'Muscat', 'Ujjain'
];

/**
 * Parses any workstation folder path (e.g. F:\Safar_1448_Colombo or E:\Ashara_1448_Karachi\1448-02-03_Day_03)
 * Detects whether a date folder was included by the user, and if not, auto-generates & appends it.
 */
export function parseSafarPath(rawPath, options = {}) {
  if (!rawPath || typeof rawPath !== 'string') {
    return null;
  }

  // 1. Normalize slashes and trim
  const cleanPath = rawPath.trim().replace(/\//g, '\\').replace(/\\+$/, '');
  if (!cleanPath) return null;

  // 2. Extract Drive Root (e.g. F:\)
  const driveMatch = cleanPath.match(/^([a-zA-Z]:)/);
  const driveRoot = driveMatch ? `${driveMatch[1].toUpperCase()}\\` : (options.defaultDrive || 'F:\\');

  // Split path into segments
  const segments = cleanPath.split('\\').filter(Boolean);

  // 3. Inspect if the trailing segment contains a date / Day identifier
  // e.g. 1448-02-01_Day_01 | 2026-11-06 | Day_03 | Day 03 | Day-02 | D01
  const datePattern = /(\d{4})[-_](\d{1,2})[-_](\d{1,2})(_Day_?(\d+))?/i;
  const dayOnlyPattern = /^(?:Day|Majlis|D)[-_ ]?0?(\d+)$/i;

  let hasUserDate = false;
  let detectedDateFolder = null;
  let detectedDayNumber = 1;
  let safarBasePath = cleanPath;

  const lastSegment = segments[segments.length - 1] || '';

  const dateMatch = lastSegment.match(datePattern);
  const dayMatch = lastSegment.match(dayOnlyPattern);

  if (dateMatch || dayMatch) {
    // The user or workstation path ALREADY explicitly included a date
    hasUserDate = true;
    detectedDateFolder = lastSegment;
    if (dateMatch && dateMatch[5]) {
      detectedDayNumber = parseInt(dateMatch[5], 10);
    } else if (dateMatch && dateMatch[3]) {
      detectedDayNumber = parseInt(dateMatch[3], 10);
    } else if (dayMatch && dayMatch[1]) {
      detectedDayNumber = parseInt(dayMatch[1], 10);
    }
    // Safar root path is parent folder without this date segment
    safarBasePath = segments.slice(0, -1).join('\\');
  }

  // 4. Extract Safar Name, Hijri Year, and City from Safar Base Path
  const baseSegments = safarBasePath.split('\\').filter(Boolean);
  const safarFolderSegment = baseSegments[baseSegments.length - 1] || 'Safar_Campaign';

  // Detect Hijri Year (e.g. 1447, 1448, 1449, 1450)
  const yearMatch = safarBasePath.match(/\b(144[0-9]|145[0-9])\b/);
  const hijriYear = yearMatch ? `${yearMatch[1]} H` : (options.hijriYear || '1448 H');
  const yearDigits = hijriYear.replace(/[^0-9]/g, '') || '1448';

  // Detect City
  let detectedCity = options.city || null;
  if (!detectedCity) {
    for (const city of KNOWN_CITIES) {
      const cityRegex = new RegExp(`\\b${city.replace(/\s+/g, '[_\\s]?')}\\b`, 'i');
      if (cityRegex.test(safarBasePath)) {
        detectedCity = city;
        break;
      }
    }
  }

  // Fallback city extraction from folder name
  if (!detectedCity) {
    const candidate = safarFolderSegment
      .replace(/safar/gi, '')
      .replace(/ashara/gi, '')
      .replace(/144[0-9]/g, '')
      .replace(/workspace/gi, '')
      .replace(/vault/gi, '')
      .replace(/central/gi, '')
      .replace(/[_\-\s]+/g, ' ')
      .trim();
    detectedCity = candidate || 'Central Workstation';
  }

  // Clean formatted Safar Name
  const cleanSafarName = options.safarName || `Safar ${yearDigits} — ${detectedCity}`;
  const totalDays = parseInt(options.totalDays, 10) || 10;

  // 5. AUTO-ADD DATE IN SAFAR PATH IF NOT ADDED BY USER
  // If user did not provide a date folder, One Tap automatically constructs:
  // e.g. "1448-02-01_Day_01" and appends it to form the full resolved active date path
  const primaryDayNum = detectedDayNumber || 1;
  const primaryDayFormatted = primaryDayNum < 10 ? `0${primaryDayNum}` : `${primaryDayNum}`;
  const autoDateFolder = `${yearDigits}-02-${primaryDayFormatted}_Day_${primaryDayFormatted}`;

  const resolvedDateFolder = hasUserDate ? detectedDateFolder : autoDateFolder;
  const resolvedDatePath = `${safarBasePath}\\${resolvedDateFolder}`;

  // 6. Generate the full production dates list
  const dates = Array.from({ length: totalDays }, (_, i) => {
    const dayNum = i + 1;
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateFolder = `${yearDigits}-02-${formattedDay}_Day_${formattedDay}`;
    const datePath = `${safarBasePath}\\${dateFolder}`;

    const isThisDayActive = dayNum === primaryDayNum;

    return {
      id: `d_${yearDigits}_${formattedDay}`,
      dayNumber: dayNum,
      dateLabel: `${yearDigits}-02-${formattedDay}`,
      dateFolder: dateFolder,
      datePath: datePath,
      hijriDate: `${dayNum} Safar al-Muzaffar ${hijriYear}`,
      title: `Majlis ${dayNum} — ${detectedCity} Discourse`,
      assignedEditor: options.username || 'admin',
      status: 'editing_pending',
      uploaded_at: null,
      uploaded_by: null,
      file_size_gb: 40.0,
      server_path: null,
      was_auto_date_added: !hasUserDate && isThisDayActive
    };
  });

  const safarId = 'safar_' + yearDigits + '_' + detectedCity.toLowerCase().replace(/[^a-z0-9]/g, '_');

  return {
    safarId,
    safarName: cleanSafarName,
    city: detectedCity,
    hijriYear,
    driveRoot,
    safarBasePath,
    hasUserDate,
    resolvedDateFolder,
    resolvedDatePath,
    autoAddedDateFolder: autoDateFolder,
    autoAddedDatePath: `${safarBasePath}\\${autoDateFolder}`,
    totalDays,
    dates,
    isAutoDateAdded: !hasUserDate
  };
}

/**
 * Checks existing campaigns for a matching Safar or creates a new one automatically.
 */
export function autoResolveSafarCampaign(rawPath, existingCampaigns = [], options = {}) {
  const parsed = parseSafarPath(rawPath, options);
  if (!parsed) return null;

  // Check if this Safar already exists by ID, baseDirectory, or Name
  const normalizedBase = parsed.safarBasePath.toLowerCase();
  const existing = existingCampaigns.find(c => 
    (c.baseDirectory && c.baseDirectory.toLowerCase() === normalizedBase) ||
    c.id === parsed.safarId ||
    (c.safarName && c.safarName.toLowerCase() === parsed.safarName.toLowerCase())
  );

  if (existing) {
    return {
      isNew: false,
      campaign: existing,
      parsed,
      resolvedDatePath: parsed.resolvedDatePath,
      wasDateAdded: parsed.isAutoDateAdded
    };
  }

  // Create new Safar Campaign object
  const newCampaign = {
    id: parsed.safarId,
    safarName: parsed.safarName,
    name: parsed.safarName,
    hijriYear: parsed.hijriYear,
    city: parsed.city,
    serialNumber: `SN-${Date.now().toString().slice(-4)}`,
    driveRoot: parsed.driveRoot,
    venue: options.venue || 'Main Complex',
    baseDirectory: parsed.safarBasePath,
    serverDestination: `//aljamea-nas.local/Central_Vault/${parsed.safarName.replace(/[^a-zA-Z0-9_]/g, '_')}`,
    totalDays: parsed.totalDays,
    is_archived: false,
    is_safar_done: false,
    detected_by: 'onetap_workstation',
    detected_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    created_by: options.username || 'admin',
    dates: parsed.dates,
    lastDetectedPath: parsed.resolvedDatePath,
    auto_date_injected: parsed.isAutoDateAdded
  };

  return {
    isNew: true,
    campaign: newCampaign,
    parsed,
    resolvedDatePath: parsed.resolvedDatePath,
    wasDateAdded: parsed.isAutoDateAdded
  };
}
