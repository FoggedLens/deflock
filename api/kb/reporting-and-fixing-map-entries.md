Q: I found a camera — can you add it to the map for me?
A: Thanks for the report :) You can use our DeFlock.me mobile app! See: https://deflock.org/report — you'll need an account with OpenStreetMap.org (aka OSM — if you're not familiar, think "Wikipedia for maps," they operate the backend database we use to inform our map) to make edits. We have some documentation at https://deflock.org/app/docs but it's a work in progress; happy to answer any questions.

Q: I found something on the map that isn't actually a Flock/ALPR (or is otherwise wrong) — how do I get it fixed?
A: Thanks for the report! A little technical background — our map shows a subset of the OpenStreetMap database; you can directly make edits yourself by signing up for an account with them. Our mobile app is a focused OSM client intended to make the process as easy as possible, but you can use any client/editor you like, including OSM's official web editor called "iD." See https://deflock.org/report for instructions on both that and our app. Beyond that, it's often a good idea to reach out to the original submitter via OSM direct message to politely correct their mistake so it hopefully doesn't continue happening. Thanks for keeping an eye out and helping us clean up the map — that's a very important part of maintaining any collaborative dataset, and we sincerely appreciate it.

Q: Can I add a non-ALPR device, or a mobile/temporary installation, to the map?
A: They ARE mappable, but as you noted, they're not in the default profile list. The most recent app update lets us provide "import app profile" links right on our Identify page: deflock.org/identify — we're working to add more things there, including sneaky/uncommon setups. You can also create custom profiles yourself under Settings > Profiles; figuring out the right tags is the fun part.

DeFlock uses OpenStreetMap data, and OSM has standards and conventions that should be followed. One of those: generally do NOT map temporary installations like trailers or traffic cones. That said, if you're willing to take personal responsibility for keeping the map updated as things change, the accepted way to mark such an object is with the tag `temporary=yes`: https://wiki.openstreetmap.org/wiki/Key:temporary

Q: A camera, manufacturer, or other "thing" isn't listed on the website or in the app — can you add it?
A: Yes! We have a backlog of things to add to the Identify page; we'll make sure it's on the list. The app can import profiles directly from the website now, but we've avoided including everything by default to keep the built-in list from getting too long.

Q: When was a specific camera/entry added to the map or website (logged date, not physical install date)?
A: You can get the date it was logged using our site:
1. Go to your area on our map: https://maps.deflock.org
2. Click the blue camera icon to bring up info on a specific camera
3. Click "View OSM" to open the detailed information panel
4. Click "Download XML"
5. Look for the field tagged "Timestamp"

Feel free to reach out if you need help with this.

Q: Why do I have to give OpenStreetMap my email address just to make an edit?
A: Sadly, some means of tracking and blocking bad actors (and reverting their edits) is required due to spam and vandalism. For context: DeFlock doesn't run our own database — our map pulls from OpenStreetMap, which has been solving the problems of collaborative mapping for over 20 years (think "Wikipedia for maps" if you're not familiar). All OSM asks for is an email address, and you're welcome to sign up with a throwaway over a VPN if you prefer. Our mobile app is just a focused client for OSM tailored to this task — you can use any editor you like, including the online "iD" editor at openstreetmap.org.
