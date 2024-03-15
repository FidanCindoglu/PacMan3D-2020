/**
 * 3D karakteri temsil eden temel sınıf.
 */
class Character3D extends THREE.Object3D {
    /**
     * Sınıfın kurucusu. Yeni bir 3D karakter oluşturun.
     * @param {number} speed Karakter hızı.
     * @param {orientation} orientation Karakterin oryantasyonu.
     */
    constructor(speed, orientation) {
        super();

        this.speed = speed;
        this.orientation = orientation;

        // Nesnenin oluşturulduğu zaman da elde edilir
        // Türetilmiş sınıfların update() yöntemlerinde kullanılır.
        this.lastUpdateTime = Date.now();
    }

    getOrientation() {
        return this.orientation;
    }

    setOrientation(orientation) {
        this.orientation = orientation;
    }

    getSpeed() {
        return this.speed;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    /**
     * Yönü güncelleme yöntemi. Karakteri doğru yönlendirmek için türetilmiş sınıfların 
     * update() yönteminde kullanılır.
     */
    updateOrientation() {
        switch(this.orientation) {
            case orientations.UP:
                this.rotation.y = Math.PI / 2;
                break;
            case orientations.DOWN:
                this.rotation.y = -Math.PI / 2;
                break;
            case orientations.LEFT:
                this.rotation.y = Math.PI;
                break;
            case orientations.RIGHT:
                this.rotation.y = 0;
                break;
        }
    }
}