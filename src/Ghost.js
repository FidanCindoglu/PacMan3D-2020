/**
 * Bir hayaleti temsil eden sınıf.
 */
class Ghost extends Character3D {
    /**
     * Sınıfın kurucusu. Yenilebilir olduğunda animasyonla birlikte belirli bir renkte yeni bir hayalet oluşturur.
     * @param {number} speed Karakterin hareket ettiği hız.
     * @param {number} ghostColor Hayaletin temel rengini temsil eden onaltılık sayı.
     */
    constructor(speed, ghostColor) {
        super(speed, orientations.LEFT);
        
        ////////////////////////////////////////////////////////////////////////
        // Nitelikleri ayarlama

        // Hayaletin ortaya çıkıp çıkmadığını gösterir
        this.spawned = false;

        // Hayaletin yenilebilir olup olmadığını gösterir
        this.edible = false;

        // Bu öznitelik, yenilebilir olduğunda animasyon'da kullanılır.
         // iki malzeme arasında kesinti efekti yaratma
         // Güncelleme yöntemine yapılan çağrıların sayısını sayma
         // belirli bir andaki animasyon
        this.ticksChange = 0;

        // Temel malzemeler ve hayaletin yenilebilir durumu
        this.ghostMaterial = new THREE.MeshPhongMaterial({color: ghostColor});
        this.edibleMaterials = [
            new THREE.MeshPhongMaterial({color: 0x0037C2}),
            new THREE.MeshPhongMaterial({color: 0xEEEEEE})
        ];

        // Yenilebilir durumda hayaletin sahip olacağı bir sonraki malzeme
        this.nextEdibleMaterial = 0;

        // Göz malzemeleri
        var eyeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
        var pupilMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});

        // Hayalet kafa oluşturun ve konumlandırın
        var radius = 0.5;
        var segments = 25;
        var head = new THREE.SphereBufferGeometry(radius, segments, segments, 0, Math.PI);

        this.headMesh = new THREE.Mesh(head, this.ghostMaterial);

        this.headMesh.rotation.x = -Math.PI / 2;
        this.headMesh.position.y += 0.5;

        // Gövde oluşturun ve konumlandırın
        var boydGeometry = new THREE.CylinderBufferGeometry(radius, radius, 0.52, segments)
        this.bodyMesh = new THREE.Mesh(boydGeometry, this.ghostMaterial);

        this.bodyMesh.position.y += 0.25;

        // Gözler oluşturun ve konumlandırın
        var eyeGeometry = new THREE.CylinderBufferGeometry(0.5, 0.5, 0.1, segments);

        eyeGeometry.scale(0.15, 0.5, 0.4);
        eyeGeometry.rotateX(-Math.PI/2);
        eyeGeometry.translate(-0.15, 0.5, 0.5);

        var pupilGeometry = eyeGeometry.clone();

        pupilGeometry.scale(2/3, 2/3, 1);
        pupilGeometry.translate(-0.05, 0.175, 0.025);

        var eyeMesh = new THREE.Mesh(eyeGeometry, eyeMaterial);
        var pupilMesh = new THREE.Mesh(pupilGeometry, pupilMaterial);

        var leftEyeMesh = new THREE.Object3D();
        leftEyeMesh.add(eyeMesh);
        leftEyeMesh.add(pupilMesh);

        var rightEyeMesh = leftEyeMesh.clone();
        rightEyeMesh.position.x += 0.3;

        // Hayaleti temsil eden düğüm
        var ghostMesh = new THREE.Object3D();
        
        ghostMesh.add(this.headMesh);
        ghostMesh.add(this.bodyMesh);
        ghostMesh.add(leftEyeMesh);
        ghostMesh.add(rightEyeMesh);
        ghostMesh.rotation.y = Math.PI/2;

        this.add(ghostMesh);

        // Hayalet yenilebilir olduğunda başlatılan animasyon
        // 8 saniye sürer
        var init = {x: 0};
        var end = {x: 1};

        this.ediblePeriod = new TWEEN.Tween(init)
            .to(end, 8000)
            .onUpdate(() => {
                // Hayaletin geçtiği zamanın %70'i geçtiğinde
                // yenilebilir, her 100 tıklamada bir (bu yönteme yapılan çağrılar)
                // hayaletin rengini değiştirerek kesinti hissi verir
                if (init.x > 0.7) {
                    this.ticksChange++;

                    if (this.ticksChange > 100) {
                        this.ticksChange = 0;

                        this.bodyMesh.material = this.edibleMaterials[this.nextEdibleMaterial];
                        this.headMesh.material = this.edibleMaterials[this.nextEdibleMaterial];

                        this.nextEdibleMaterial = (this.nextEdibleMaterial + 1) % this.edibleMaterials.length;
                    }
                }
            })
            .onComplete(() => {
                // Hayaletin artık yenilebilir olmadığını belirtin ve geri yükleyin
                // malzeme tabanı
                this.edible = false;
                this._restoreBaseMaterial();

                console.log("Ghost is no longer edible!");
            });
    }
    
    getSpawned() {
        return this.spawned;
    }
    setSpawned(spawned) {
        this.spawned = spawned;
    }

    getEdible() {
        return this.edible;
    }

    /**
     * Ghost'un yenilebilir olup olmadığını belirleyen ve giriş değerine göre animasyonu başlatan veya durduran yöntem.
     * @param {boolean} edible Boolean, hayaletin yenilebilir olup olmadığını gösterir.
     */
    setEdible(edible) {
        this.edible = edible;

        if (this.edible) {
            // Listedeki ilk malzeme ile animasyonu başlatın
            this.nextEdibleMaterial = 0;
            this.ticksChange = 0;

            this.headMesh.material = this.edibleMaterials[this.nextEdibleMaterial];
            this.bodyMesh.material = this.edibleMaterials[this.nextEdibleMaterial];

            this.nextEdibleMaterial++;

            this.ediblePeriod.start();
        } else {
            // Animasyonu durdurun ve temel malzemeyi geri yükleyin
            this.ediblePeriod.stop();
            this._restoreBaseMaterial();    
        }
    }

    /**
     * Hayaletin temel malzemesini geri yüklemeyi sağlayan yöntem.
     */
    _restoreBaseMaterial() {
        this.headMesh.material = this.ghostMaterial;
        this.bodyMesh.material = this.ghostMaterial;
    }

    /**
     * Hayaletin durumunu güncelleyen yöntem (yenilebilir olduğunda konumu ve animasyonu).
     */
    update() {
        // Son güncellemeden bu yana kat edilen mesafeyi artırın
        var currentTime = Date.now();
        var deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        var distanceIncrement = this.speed * deltaTime;

        // Hayalet ortaya çıktıysa, konumu güncelleyin
        if (this.spawned) {
            // Yönlerine göre karakteri döndür
            this.updateOrientation();
    
            // Yönlendirmeyi güncelle
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
        }

        TWEEN.update();

        this.lastUpdateTime = currentTime;
    }
}