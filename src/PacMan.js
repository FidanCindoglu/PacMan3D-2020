/**
 * PacMan'i temsil eden sınıf.
 */
class PacMan extends Character3D {
    /**
     * Sınıfın kurucusu. Ağız animasyonu ve hareketin sesi ile birlikte yeni bir PacMan modeli oluşturma.
     * @param {number} speed Karakterin hareket ettiği hız.
     */
    constructor(speed) {
        super(speed, orientations.LEFT);

        // Vücut ve göz malzemeleri
        var bodyMaterial = new THREE.MeshPhongMaterial({color: 0xF2F21A});
        var eyeMaterial = new THREE.MeshPhongMaterial({color: 0x000000});

        // Gövde malzemesi içte ve dışta görünür olmalı
        bodyMaterial.side = THREE.DoubleSide;

        // Ağzın üstünü ve altını oluşturma
        var radiusMouth = 0.5;
        var segmentsMouth = 25;
        var uppperMouthGeometry = new THREE.SphereBufferGeometry(radiusMouth, segmentsMouth, segmentsMouth, 0, Math.PI);

        uppperMouthGeometry.rotateX(-Math.PI / 2);

        var lowerMouthGeometry = uppperMouthGeometry.clone();
        lowerMouthGeometry.rotateX(Math.PI);

        var upperMouthMesh = new THREE.Mesh(uppperMouthGeometry, bodyMaterial);
        var lowerMouthMesh = new THREE.Mesh(lowerMouthGeometry, bodyMaterial);

        // Gözleri oluşturma ve konumlandırma
        var radiusEyes = 0.05;
        var segmentsEyes = 15;
        var eyeAngle = (40 * Math.PI) / 180;

        var leftEyeGeometry = new THREE.SphereBufferGeometry(radiusEyes, segmentsEyes, segmentsEyes);
        var rightEyeGeometry = leftEyeGeometry.clone();
        
        var leftEyeMesh = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
        var rightEyeMesh = new THREE.Mesh(rightEyeGeometry, eyeMaterial);

        leftEyeMesh.position.set(-0.1, radiusMouth * Math.sin(eyeAngle), -radiusMouth * Math.cos(eyeAngle));
        rightEyeMesh.position.set(-0.1, radiusMouth * Math.sin(eyeAngle), radiusMouth * Math.cos(eyeAngle));

        // Karakteri temsil eden düğüm oluşturma
        var pacmanNode = new THREE.Object3D();
        
        pacmanNode.add(upperMouthMesh);
        pacmanNode.add(lowerMouthMesh);
        pacmanNode.add(leftEyeMesh);
        pacmanNode.add(rightEyeMesh);
        pacmanNode.position.y += 0.5;

        this.add(pacmanNode);

        // ağız animasyonu
        var initMouthPosition = {alfa: 0};
        var endMouthPosition = {alfa: Math.PI / 6};
        
        this.mouthAnimation = new TWEEN.Tween(initMouthPosition)
            .to(endMouthPosition, 250)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                upperMouthMesh.rotation.z = initMouthPosition.alfa;
                lowerMouthMesh.rotation.z = -initMouthPosition.alfa;
            })
            .repeat(Infinity)
            .yoyo(true)
            .start();
        
        // Hareket ederken karakter sesi
        this.chompSound = new Audio("audio/pacman_chomp.wav");
        this.chompSound.preload = "auto";
        this.chompSound.volume = 0.5;
    }

    /**
     * Karakterin durumunu güncelleyen yöntem (konumu, dönüşü ve ağzın animasyonu).
     * @param {boolean} collided Boolean, karakterin bir duvarla çarpışıp çarpışmadığını gösterir.
     */
    update(collided) {
        // Son güncellemeden bu yana kat edilen mesafeyi artırrma
        var currentTime = Date.now();
        var deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        var distanceIncrement = this.speed * deltaTime;

        // Yönlerine göre karakteri döndür
        this.updateOrientation();

        // Kontrol animasyon durumu
        if (collided && !this.mouthAnimation.isPaused()) {
            this.mouthAnimation.pause();
        } else if (!collided && this.mouthAnimation.isPaused()){
            this.mouthAnimation.resume();
        }
        
        // Çarpışmadıysa konumu güncelleyin, ses çalın ve ağız animasyonunu güncelleyin
        if (!collided) {
            switch(this.orientation) {
                case orientations.UP:
                    this.position.z -= distanceIncrement;
                    break;
                case orientations.DOWN:
                    this.position.z += distanceIncrement;
                    break;
                case orientations.LEFT:
                    this.position.x -= distanceIncrement;
                    break;
                case orientations.RIGHT:
                    this.position.x += distanceIncrement;
                    break;
            }

            this.chompSound.play();
            
            TWEEN.update();
        } else {
            // Çarpışma durumunda sesi duraklatması için
            this.chompSound.pause();
        }

        this.lastUpdateTime = currentTime;
    }
}