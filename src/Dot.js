/**
 * Değişken boyutlu bir noktayı temsil eden sınıf.
 */
class Dot extends THREE.Object3D {
    /**
     * Sınıfın kurucusu. Yeni bir nokta oluşturun.
     * @param {number} radius Puan radyo.
     */
    constructor(radius) {
        super();

        // Malzeme ve geometri oluşturma
        var material = new THREE.MeshPhongMaterial({color: 0xff3030});
        var geometry = new THREE.SphereBufferGeometry(radius, 15, 15);

        // Kafes oluşturma ve konumlandırma
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.5;

        this.add(mesh)
    }
}