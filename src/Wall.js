/**
 * Bir duvarı temsil eden sınıf
 */
class Wall extends THREE.Object3D {
    /**
     * Sınıfın kurucusu. Yeni bir duvar oluşturun.
     */
    constructor() {
        super();

        // Duvar malzemeleri
        var wallMaterial = new THREE.MeshPhongMaterial({color: 0x97ffff});

        // duvarın geometrisi
        var height = 0.75;
        var wallGeometry = new THREE.BoxBufferGeometry(1, height, 1);
        wallGeometry.translate(0, height/2, 0);

        var wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

        this.add(wallMesh);
    }
}