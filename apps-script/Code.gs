/**
 * Reception Photo Wall — Google Apps Script backend
 * ---------------------------------------------------
 * Runs under YOUR Google account. No API keys, no OAuth flow, no database.
 * Receives photos from the website and drops them into a shared Drive folder.
 *
 * This is a standalone deployment — separate from any other app (e.g. a
 * seat-finder app) even if you point FOLDER_ID at the same Drive folder.
 *
 * SETUP (one time):
 *   1. Create (or reuse) the shared Google Drive folder for the photos.
 *   2. Open its URL — the folder ID is the long string after /folders/ :
 *        https://drive.google.com/drive/folders/THIS_IS_THE_FOLDER_ID
 *   3. Paste it into FOLDER_ID below.
 *   4. In script.google.com: New project → paste this file.
 *   5. Deploy → New deployment → type "Web app"
 *        · Execute as:  Me
 *        · Who has access:  Anyone
 *   6. Copy the Web App URL → paste into src/config.ts (APPS_SCRIPT_URL).
 *
 * Re-deploy note: after editing this script you must "Manage deployments →
 * edit → Version: New version" for changes to take effect at the same URL.
 */

// ── EDIT THIS ──────────────────────────────────────────────
var FOLDER_ID = 'PASTE_YOUR_DRIVE_FOLDER_ID_HERE'
// ───────────────────────────────────────────────────────────

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents)
    return savePhoto(data)
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) })
  }
}

function savePhoto(data) {
  var folder = DriveApp.getFolderById(FOLDER_ID)
  var mimeType = data.mimeType || 'image/jpeg'
  var ext = (mimeType.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
  var safeName = String(data.guestName || 'guest')
    .replace(/[^\w\-]+/g, '_')
    .replace(/^_+|_+$/g, '')
  var filename = safeName + '_' + Date.now() + '.' + ext

  var bytes = Utilities.base64Decode(data.imageBase64)
  var blob = Utilities.newBlob(bytes, mimeType, filename)
  var file = folder.createFile(blob)

  // Make it viewable by link so the gallery's CDN thumbnail URLs load.
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
  } catch (e) {
    /* org policy may block link sharing; upload still succeeds */
  }
  // Bust the gallery cache so the new photo shows up promptly.
  CacheService.getScriptCache().remove('photos')

  return jsonOut({ ok: true, id: file.getId(), name: filename })
}

// List image files in the folder (id + name), newest first. Cached 30s so a
// busy photo wall doesn't re-scan Drive on every refresh.
// Gated only by "a name was provided" — this app has no guest list to check
// against, so any non-empty name (whatever the guest typed) unlocks the wall.
function listPhotos(name) {
  if (!name) {
    return jsonOut({ ok: false, error: 'unauthorized' })
  }

  var cache = CacheService.getScriptCache()
  var hit = cache.get('photos')
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON)

  var it = DriveApp.getFolderById(FOLDER_ID).getFiles()
  var arr = []
  while (it.hasNext()) {
    var f = it.next()
    if (String(f.getMimeType()).indexOf('image/') !== 0) continue
    arr.push({ id: f.getId(), name: f.getName(), t: f.getDateCreated().getTime() })
    if (arr.length >= 1000) break
  }
  arr.sort(function (a, b) { return b.t - a.t })

  var out = JSON.stringify({ ok: true, photos: arr })
  cache.put('photos', out, 30)
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON)
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {}
    if (params.photos) return listPhotos(params.name)
    return jsonOut({ ok: true, ready: true }) // health check
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) })
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
