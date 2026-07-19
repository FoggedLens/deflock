Q: What the heck are these things? What is an ALPR?
A: Automatic License Plate Readers are cameras that private businesses and local municipalities install that capture and analyze images of all passing vehicles, storing details like your car's location, date, and time. They also capture your car's make, model, color, and identifying features such as dents, roof racks, and bumper stickers. These images are turned into data points for a searchable database that law enforcement does not need a warrant to access.

Q: I think I've misidentified a traffic cam / red light cam as a Flock/ALPR — how can I tell the difference?
A: The ones you see at intersections are (almost always) strictly for changing the traffic lights. They're mostly really poor quality image sensors, and the systems they connect to are mostly offline. Easy rule of thumb is that if it's facing the front of your car, it's probably traffic monitoring; if it's looking at the back, it's probably a privacy issue (an ALPR). Not always true, but probably 95%.

That said, traffic cams are totally mappable — you'd just need to create a custom tag profile in the DeFlock app for that. Something along the lines of:
```
Name: "unknown traffic cam"
man_made=monitoring_station
monitoring:traffic=yes
camera:type=fixed
camera:mount=pole
```
You can add `manufacturer=` if you know it. Generally the FOV should be left blank unless it's a 360 or PTZ camera.

Because these aren't ALPRs, they won't appear on the deflock.org website. But if you have a profile for it, your app will show them.

Side note: OpenStreetMap maps just about everything. DeFlock is just a focused, limited client tailored to ALPR mapping. Nothing stops you from mapping park benches, utility poles, or fire hydrants in OSM directly — you'd probably want to use a fuller OSM client like JOSM, StreetComplete, or GoMap for that, but it's all the same OSM data on the backend.
