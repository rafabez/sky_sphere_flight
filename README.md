# sky_sphere_flight
 An immersive browser 3D flight simulation inside a sky sphere environment with intuitive controls, dynamic lighting, and customizable textures, powered by Three.js

---

## About

Sky Sphere Flight is a 3D interactive experience built with [Three.js](https://threejs.org/). This project features custom flight and orbit controls, allowing users to navigate a textured spherical environment with seamless responsiveness across devices. Designed for enthusiasts of 3D exploration and developers interested in WebGL applications.

---

## Features

- **Flight Controls**: Navigate freely using the FlyControls module.
- **Touch Compatibility**: Intuitive touch gestures for mobile and tablet users.
- **Custom Textures**: Dynamic sky sphere and terrain with applied textures.
- **Lighting**: Ambient and directional lighting for realistic rendering.
- **Responsive Design**: Adapts to various screen sizes and resolutions.

---

## Live Demo

Experience the simulation live: [Sky Sphere Flight Demo](https://rafabeznos.com.br/fx/three_dee/index.html)

---

## Getting Started

### Prerequisites
- A modern web browser with WebGL support (e.g., Chrome, Firefox, Edge).
- [Node.js](https://nodejs.org/) for local development (optional).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/rafabez/sky_sphere_flight.git
   cd sky_sphere_flight
   ```

2. Open the project:
   - Launch `index.html` directly in your browser.
   - Or serve the project using a local server (e.g., Live Server or http-server):
     ```bash
     npx http-server
     ```

3. Explore the 3D flight experience.

---

## Controls

### Desktop:
- **Mouse**: Drag to look around.
- **Keyboard**: Use WASD keys for movement and arrow keys for rotation.
- **Zoom**: Use the mouse wheel.

### Mobile/Tablet:
- **Pan & Tilt**: Drag with one finger.
- **Zoom**: Pinch with two fingers.

---

## Customization

### 1. Replace Textures
Sky and terrain textures can be replaced with your custom images:
- **Sky Texture**: Replace `backgroundTexture.jpg` in the project folder.
- **Terrain Texture**: Replace `terrainTexture.jpg`.

### 2. Adjust Lighting
Modify lighting intensity and direction in `index.html`:
```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Adjust intensity
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0); // Adjust direction
```

### 3. Modify Controls
Customize movement speed and rotation in `FlyControls.js`:
```javascript
controls.movementSpeed = 50; // Adjust movement speed
controls.rollSpeed = Math.PI / 24; // Adjust roll speed
```

---

## Technologies Used

### [Three.js](https://threejs.org/)
A powerful WebGL-based JavaScript library for creating 3D graphics. It powers the rendering of the sky sphere, textures, lighting, and camera controls.

### [FlyControls](https://threejs.org/examples/#controls/FlyControls)
A Three.js module for intuitive flight navigation, allowing free movement through the 3D space.

### [OrbitControls](https://threejs.org/examples/#controls/OrbitControls)
A Three.js module for orbiting and panning around objects in the scene, used for touch-based gestures.

---

## References

- [Three.js Documentation](https://threejs.org/docs/)
- [FlyControls Example](https://threejs.org/examples/#controls/FlyControls)
- [OrbitControls Example](https://threejs.org/examples/#controls/OrbitControls)
- [WebGL Fundamentals](https://webglfundamentals.org/)

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contributing

Contributions are welcome! If you'd like to improve or add features:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-branch-name`.
3. Commit your changes: `git commit -m "Add new feature"`.
4. Push to the branch: `git push origin feature-branch-name`.
5. Open a pull request.

---

## Author

[**rafabez**](https://github.com/rafabez)  
Visit my website: [rafabeznos.com.br](https://rafabeznos.com.br)
