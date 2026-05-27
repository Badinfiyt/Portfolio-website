export function onRequestGet() {
  return Response.json({
    name: "Ajinkya Attarde",
    role: "Creative Developer",
    location: "Toronto, Canada",
    focus: ["Front-end UI", "Node.js", "Interactive Web"],
    email: "ajattarde@gmail.com"
  });
}
