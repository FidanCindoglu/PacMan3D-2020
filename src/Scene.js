/**
 * Sahneyi temsil eden sınıf.
 */
class Scene extends THREE.Scene {
    /**
     * Sınıfın kurucusu. Yeni bir sahne oluşturun.
     * @param {canvas} myCanvas Sahnenin boyanacağı tuval.
     */
    constructor (myCanvas) {
        super();

        // Sahneyi görselleştirmek için oluşturucuyu oluşturun
        this.renderer = this.createRenderer(myCanvas);

        // Oyun bilgilerini içeren nesne oluştur
        this.game = new GameUtils();

        //PacMan ve hayalet yumurtlama noktaları
        this.pacmanSpawnPoint = new THREE.Vector3(0, 0, 0);
        this.ghostSpawnPoint = new THREE.Vector3(0, 0, 0);

        // Haritayı oluştur
        // Bilgileri this.objectsMap'e kaydedin
        this.objectsMap = [];
        this.createMap();

        // Zemini oluştur
        this.createGround();

        // Işıkları oluştur
        this.createLights();

        // PacMan'in hareket edip edemeyeceğini gösteren nitelik
        this.canMovePacman = false;

        // Son seferden bu yana geçen tik sayısını gösteren nitelik
        // bir hayaletin yeni bir yön seçmesi
        this.ticksDirectionChange = [0, 0, 0, 0];

        // PacMan'i oluşturun ve konumlandırın
        this.pacman = new PacMan(this.game.getPacmanSpeed());
        this.pacman.position.set(this.pacmanSpawnPoint.x, this.pacmanSpawnPoint.y, this.pacmanSpawnPoint.z);
        this.add(this.pacman);

        // Hayaletler oluşturun ve konumlandırın
        this.ghosts = [
            new Ghost(this.game.getGhostSpeed(), 0xFF0000),
            new Ghost(this.game.getGhostSpeed(), 0xFFA9E0),
            new Ghost(this.game.getGhostSpeed(), 0x1AF2EF),
            new Ghost(this.game.getGhostSpeed(), 0xFFBE29)
        ];

        this.ghosts.forEach((ghost) => {
            ghost.position.set(this.ghostSpawnPoint.x, this.ghostSpawnPoint.y, this.ghostSpawnPoint.z);
        });

        // Kamera oluştur
        this.createCameras();
        
        // Başlangıç ​​noktalama işaretlerini yaz
        document.getElementById('Score').textContent = this.game.getScore();

        // Canları temsil eden görüntüler oluşturun
        for (let i = 0; i < this.game.getRemainingLives(); i++) {
            let life = document.createElement("img");
            life.src = "img/pacman_icon.png";
            document.getElementById("lives").appendChild(life);
        }

        ////////////////////////////////////////////////////////////////////////
        // Animasyonlar

        // Animasyon 1: Yumurtlayan hayaletler
        var initSpawn = {x: 0};
        var end = {x: 1};

        // Sahnede görünecek bir sonraki hayaletin dizini
        this.nextGhost = 0;

        // Hayaletlerin ilk görünümünü kontrol eden animasyon
        this.spawnGhosts = new TWEEN.Tween(initSpawn)
            .to(end, 3000)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                if (initSpawn.x == end.x) {
                    this.add(this.ghosts[this.nextGhost]);
                    this._spawnGhost(this.ghosts[this.nextGhost]);
                    this.nextGhost++;
                }
            })
            .onComplete(() => {
                console.log('All ghosts spawned!')
            });

        // Animasyon 2: Oyunun başlamasını bekleyin
        var initGameStart = {x: 0};

        // Oyun başı sesini çal
        this.game.playBeginningAudio();

        var waitGameStart = new TWEEN.Tween(initGameStart)
            .to(end, 4500)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() =>{
                this.canMovePacman = true;
                this.startGhostSpawn();
            }).start();
        
        // Animasyon 3: Hayaletleri yeniden ortaya çıkarmadan önce bekleyin
        var initBeforeSpawnGhosts = {x: 0};

        this.waitBeforeGhostsRespawn = new TWEEN.Tween(initBeforeSpawnGhosts)
            .to(end, 2000)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() => {
                this.canMovePacman = true;
                this.startGhostSpawn();
            });
    }

    /**
     * Biri PacMan'i takip edecek perspektifte ve diğeri haritayı gösterecek
     *  ortogonal olmak üzere kameraları oluşturan yöntem
     */
    createCameras() {
        // PacMan'i takip edecek bir perspektif kamera oluşturma
        // Konumlandırma, Nereye baktığını bildirme ve Sahneye yerleştirme
        this.pacmanCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.pacmanCamera.position.set(this.pacman.position.x, 10, this.pacman.position.z + 10);
        this.pacmanCamera.lookAt(this.pacman.position);
        this.add(this.pacmanCamera);

        // X, Y eksenlerinde görünüm boyutları alma
        var viewSizeX = this.objectsMap[0].length;
        var viewSizeY = this.objectsMap.length; 

        // Ortogonal kamera oluşturma, aşağı bakacak şekilde doğru  konumlandırma
        // ve sahneye yerleştirme
        this.mapCamera = new THREE.OrthographicCamera(-viewSizeX / 2, viewSizeX / 2,
            viewSizeY / 2, - viewSizeY / 2, 1, 1000);
        
        this.mapCamera.position.set(13.5, 2, 15);
        this.mapCamera.lookAt(13.5, 0, 15);
        this.add(this.mapCamera);
    }
    
    /**
     * Zemini yaratma ve onu sahneye ekleme yöntemi
     */
    createGround() {
        var groundGeometry = new THREE.BoxGeometry(100, 0.2, 100);
        var groundMaterial = new THREE.MeshPhongMaterial({color: 0x000000});

        var ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.position.y = -0.1;

        this.add(ground);
    }
    
    /**
     * Ortam ışığı ve spot ışığı yaratan ve bunları sahneye yerleştiren yöntem.
     */
    createLights() {
        // Ortam ışığını oluşturma
        var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
        this.add(ambientLight);
        
        // (0, 0, 0) işaret eden odak ışığı oluşturma.
        var spotLight = new THREE.SpotLight(0xffffff, 0.5);
        spotLight.position.set(20, 60, 40);
        this.add(spotLight);
    }
    
    /**
     * Bir oluşturucu oluşturan yöntem.
     * @param {canvas} myCanvas Sahnenin oluşturulacağı tuval.
     */
    createRenderer(myCanvas) {        
        // Bir WebGL Oluşturucu somutlaştırıldı
        var renderer = new THREE.WebGLRenderer();
        
        // Render tarafından oluşturulan görüntülerde bir arka plan rengi ayarlanır
        renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
        
        // Boyut ayarlanır, tüm tarayıcı penceresi kullanılır
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Görselleştirme alınan tuvalde gösterilir
        $(myCanvas).append(renderer.domElement);
        
        return renderer;  
    }

    /**
     * Haritayı oluşturan, hareket etmeyen ağı sahneye ekleyen 
     * ve ekstra bilgileri kaydeden yöntem.
     */
    createMap() {
        var correspondence = this.game.getCorrespondence();
        var that = this;

        this.game.getLevelMap().forEach(function(item, z) {
            let row = [];

            for (let x = 0; x < item.length; x++) {
                let meshType = correspondence[item.charAt(x)];
                row.push(meshType);

                switch(meshType) {
                    case cellType.WALL:
                        let wallMesh = new Wall();
                        wallMesh.position.set(x, 0, z);
                        that.add(wallMesh);
                        break;
                    case cellType.PACMAN:
                        that.pacmanSpawnPoint.x = x;
                        that.pacmanSpawnPoint.z = z;
                        break;
                    case cellType.SMALL_DOT:
                        that._createSmallDot(x, z);
                        break;
                    case cellType.BIG_DOT:
                        that._createBigDot(x, z);
                        break;
                    case cellType.GHOST:
                        that.ghostSpawnPoint.x = x;
                        that.ghostSpawnPoint.z = z;
                        break;
                }
            }

            that.objectsMap.push(row);
        });
    }

    /**
     * Küçük bir nokta oluşturan ve onu sahneye ekleyen bir yöntem.
     * @param {number} x Noktanın X koordinatı.
     * @param {number} z Noktanın Z koordinatı.
     */
    _createSmallDot(x, z) {
        var smallDotMesh = new Dot(0.1);
        smallDotMesh.position.set(x, 0, z);
        smallDotMesh.name = "smallDot_" + x + "_" + z;
        this.add(smallDotMesh);
        this.game.increaseRemainingDots();
    }

    /**
     * Büyük bir nokta oluşturan ve onu sahneye ekleyen bir yöntem.
     * @param {number} x Noktanın X koordinatı.
     * @param {number} z Noktanın Z koordinatı.
     */
    _createBigDot(x, z) {
        var bigDotMesh = new Dot(0.2);
        bigDotMesh.position.set(x, 0, z);
        bigDotMesh.name = "bigDot_" + x + "_" + z;
        this.add(bigDotMesh);
        this.game.increaseRemainingDots();
    }

    /**
     * PacMan, seviyenin tüm noktalarını yedikten
     *  sonra bir sonraki aşamayı yükleyen yöntem
     */
    loadNextStage() {
        // Noktaları yeniden oluşturma ve doğru şekilde konumlandırma
        for (let z = 0; z < this.objectsMap.length; z++) {
            for (let x = 0; x < this.objectsMap[z].length; x++) {
                var mesh = this.objectsMap[z][x];
                switch(mesh) {
                    case cellType.SMALL_DOT:
                        this._createSmallDot(x, z);
                        break;
                    case cellType.BIG_DOT:
                        this._createBigDot(x, z);
                        break;
                }
            }
        }

        // PacMan hızını arttırma (sınır aşılmadıysa)
        this.game.increasePacmanSpeed();

        // Hayaletlerin hızını arttırma (sınır aşılmadıysa)
        this.game.increaseGhostSpeed();

        // PacMan'i ve hayaletleri sıfırlama
        this.resetCharacters();
    }

    /**
     * Oyunun tüm karakterlerini sıfırlayan, 
     * onları durumlarına ve ilk konumlarına döndüren yöntem
     */
    resetCharacters() {
        // Karakterler sıfırlandığında PacMan hareket edemez
        this.canMovePacman = false;

        // Karakterleri sıfırla
        this.removeGhosts();
        this.respawnPacMan();

        // Hayaletleri yeniden canlandırmadan önce bekleme animasyonunu başlatma
        this.waitBeforeGhostsRespawn.start();
    }

    /**
     * Sahnedeki hayaletleri ortadan kaldıran yöntem, onların ortaya çıkışını kontrol eden 
     * animasyonu durdurur ve parametrelerini sıfırlar.
     */
    removeGhosts() {
        this.ghosts.forEach((ghost) => {
            this.remove(ghost);

            ghost.position.set(this.ghostSpawnPoint.x, this.ghostSpawnPoint.y, this.ghostSpawnPoint.z);

            ghost.setSpawned(false);
            ghost.setEdible(false);
        });

        // Ortaya çıkacak bir sonraki hayaletin indeksini sıfırlama
        this.nextGhost = 0;

        this.spawnGhosts.stop();      
    }

    /**
     * Hayaletlerin yumurtlama animasyonunu başlatan yöntem. 
     * 3 kez daha tekrarlanır, böylece 4 hayalet için yürütülür.
     */
    startGhostSpawn() {
        this.spawnGhosts.repeat(3).start();
    }

    /**
     * Tek bir hayaleti yeniden canlandıran yöntem. 
     * PacMan bir hayalet yediğinde çağrılır.
     * @param {Ghost} ghost Yeniden doğacak hayalet.
     */
    respawnSingleGhost(ghost) {
        ghost.setEdible(false);
        ghost.position.set(this.ghostSpawnPoint.x, this.ghostSpawnPoint.y, this.ghostSpawnPoint.z);
        this._spawnGhost(ghost);
    }

    /**
     * Bir hayaleti yeniden canlandırmak için kullanılan yardımcı yöntem.
     * @param {Ghost} ghost Yeniden doğacak hayalet.
     */
    _spawnGhost(ghost) {
        // Hayaletin yumurtladığını belirleme
        ghost.setSpawned(true);

        //Hızı ayarlama
        ghost.setSpeed(this.game.getGhostSpeed());

        // Rastgele olası bir başlangıç ​​yönü (sol veya sağ) seçimi
        var possibleOrientations = [orientations.LEFT, orientations.RIGHT];
        var initOrientation = possibleOrientations[Math.floor(Math.random() * possibleOrientations.length)];
        ghost.setOrientation(initOrientation);
    }

    /**
     * PacMan öldüğünde veya faz dışına çıktığında onu yeniden canlandıran yöntem.
     */
    respawnPacMan() {
        // PacMan'i sahneden kaldırma
        this.remove(this.pacman);

        // Yeni PacMan oluşturma (ağız animasyonu bu şekilde yeniden başlatılır)
        this.pacman = new PacMan(this.game.getPacmanSpeed());
        this.add(this.pacman);

        // PacMan'i konumlandırma
        this.pacman.position.set(this.pacmanSpawnPoint.x, this.pacmanSpawnPoint.y, this.pacmanSpawnPoint.z);
    }
    
    /**
     * Pencere yeniden boyutlandırıldığında meydana gelen olayı işleyen yöntem.
     */
    onWindowResize () {
        // Kameranın en boy oranını güncelleme
        this.setCameraAspect(window.innerWidth / window.innerHeight);
        
        // Oluşturucu boyutunu güncelleme
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Kameraların en boy oranını değiştiren yöntem.
     */
    setCameraAspect(ratio) {
        // PacMan'i takip eden kameranın en boy oranını güncelleyin ve güncelleyin
        // projeksiyon matrisi
        this.pacmanCamera.aspect = ratio;
        this.pacmanCamera.updateProjectionMatrix();

        // Ortogonal kameranın en boy oranı 1'dir (karedir)
        this.mapCamera.aspect = 1;
        this.mapCamera.updateProjectionMatrix();
    }

    /**
     * Tuş vuruşunu yöneten yöntem.
     * @param {event} event Meydana gelen olay. Basılan tuşu içerir.
     */
    onKeyPress(event) {
        // Anahtarı alma
        var key = event.which;

        // Önceki yönlendirmeyi alma ve ayarlamak için boolean değerini ayarlama
        // PacMan pozisyonu
        var prevOrientation = this.pacman.getOrientation();
        var adjustPosition = false;

        // PacMan hareket edebiliyorsa olayı işleme
        if (this.canMovePacman) {
            switch(String.fromCharCode(key).toUpperCase()) {
                case "A":
                    this.pacman.setOrientation(orientations.LEFT);
                    adjustPosition = prevOrientation != orientations.RIGHT && prevOrientation != orientations.LEFT;
                    break;
                case "S":
                    this.pacman.setOrientation(orientations.DOWN);
                    adjustPosition = prevOrientation != orientations.UP && prevOrientation != orientations.DOWN;
                    break;
                case "D":
                    this.pacman.setOrientation(orientations.RIGHT);
                    adjustPosition = prevOrientation != orientations.LEFT && prevOrientation != orientations.RIGHT;
                    break;
                case "W":
                    this.pacman.setOrientation(orientations.UP);
                    adjustPosition = prevOrientation != orientations.DOWN && prevOrientation != orientations.UP;
                    break;
            }
        }

        // Karakterin konumunu, oluştuysa yuvarlayarak ayarlama
        // daha önce sahip olduğu yöne dik bir yönde dönüş
        if (adjustPosition) {
            this.pacman.position.round();
        }
    }

    /**
     * PacMan'in konumunu güncelleyen, 
     * süreçte bir duvara çarpıp çarpmadığını kontrol eden yöntem.
     */
    updatePacMan() {
        var collidedWithWall = this.checkCollisionWithWall();

        // PacMan hareket edebiliyorsa, çarpışmaya göre güncelleme veya güncelleme
        if (this.canMovePacman) {
            this.pacman.update(collidedWithWall);
        } else {
            // PacMan hareket edemiyorsa, çarpıştığını belirtme
            this.pacman.update(true)
        };
    }

    /**
     *PacMan'in bir duvarla çarpışıp çarpışmadığını kontrol eden yöntem.
     * @returns Çarpışacaksa doğru, aksi halde yanlış.
     */
    checkCollisionWithWall() {
        var collided = false;

         // PacMan konumunu kısalt
         // Birçok testten sonra bunun en iyi yol olduğu görüldü.
         // duvarlarla çarpışmaları algıla.
         // Daha sonra ilgili koordinata 1 eklememiz gerekecek.
         // PacMan, kırpıldığından beri aşağı veya sağa yönlendirilir
         // bu yönlerde biraz hassasiyet kaybolur (bir
         // PacMan'in duvarın içine girmesi gerekeceğinden daha kısa kutular
         // neyin çarpıştığını görmek için, bu mantıklı değil)
        var xPos = Math.floor(this.pacman.position.x);
        var zPos = Math.floor(this.pacman.position.z);

        switch(this.pacman.getOrientation()) {
            case orientations.UP:
                collided = this.objectsMap[zPos][xPos] == cellType.WALL;
                break;
            case orientations.DOWN:
                collided = this.objectsMap[zPos + 1][xPos] == cellType.WALL;
                break;
            case orientations.LEFT:
                collided = this.objectsMap[zPos][xPos] == cellType.WALL;
                break;
            case orientations.RIGHT:
                collided = this.objectsMap[zPos][xPos + 1] == cellType.WALL;
                break;
        }

        return collided;
    }

    /**
     * Hayaletleri güncelleyen yöntem. Bir yol ayrımında olmaları durumunda seçecekleri yönü güncelleyin ve konumlarını güncelleyin. 
     * Bir kavşak, duvarsız bitişik kareleri olan ve bu komşu karelerin dik yolları olan bir karedir.
     */
    updateGhosts() {
        var that = this;
        this.ghosts.forEach(function(ghost, index) {
            that.ghostSelectNextDirection(ghost, index);
            ghost.update();
        });
    }

    /**
     * Bir hayaletin bir kavşağında aşağıdaki oryantasyonunu rastgele seçen yöntem
     * Hayalet geldiği yoldan dönmeyecek (dönmeyecek) şekilde seçilmiştir.
     * @param {Ghost} ghost Bir sonraki yönün seçileceği hayalet.
     * @param {number} index Hayalet vektörü içindeki hayalet dizini.
     */
    ghostSelectNextDirection(ghost, index) {
        var orientation = ghost.getOrientation();

// Sizinkini keserek hayaletin yönünü alın (önce 0,5 eklenir)
         // Bazı testlerden sonra, bunu yapmanın en iyi yolunun bu olduğu bulundu
        var xGhost = Math.floor(ghost.position.x + 0.5);
        var zGhost = Math.floor(ghost.position.z + 0.5);

        // Bitişik hücreler alın
        var upCell = this.objectsMap[zGhost - 1][xGhost];
        var downCell = this.objectsMap[zGhost + 1][xGhost];
        var leftCell = this.objectsMap[zGhost][xGhost - 1];
        var rightCell = this.objectsMap[zGhost][xGhost + 1];

        // Son güncellemeden bu yana 25'ten fazla onay işareti geçmiş olmalıdır
         // o hayalet için ve haritanın içinde olmalı, yani hayır
         // teleport yapabileceğiniz alanlarda olabilir
        if (this.ticksDirectionChange[index] > 25 && xGhost >= 0 && xGhost <= this.objectsMap[0].length - 1) {
            // Dikey yönde duvarsız hücreleri kontrol etme
            // sizinkine
            if (((orientation == orientations.LEFT || orientation == orientations.RIGHT) 
                    && (upCell != cellType.WALL || downCell != cellType.WALL)) ||
                ((orientation == orientations.UP || orientation == orientations.DOWN) 
                    && (leftCell != cellType.WALL || rightCell != cellType.WALL)))
            {
                // Yönlendirmeler, geri dönmeye izin vermedikleri sürece eklenir.
                // geriye
                var nextOrientations = [];

                if (upCell != cellType.WALL && orientation != orientations.DOWN) {
                    nextOrientations.push(orientations.UP);
                }
    
                if (downCell != cellType.WALL && orientation != orientations.UP) {
                    nextOrientations.push(orientations.DOWN);
                }
    
                if (leftCell != cellType.WALL && orientation != orientations.RIGHT) {
                    nextOrientations.push(orientations.LEFT);
                }
    
                if (rightCell != cellType.WALL && orientation != orientations.LEFT) {
                    nextOrientations.push(orientations.RIGHT);
                }

                var newOrientation = nextOrientations[Math.floor(Math.random() * nextOrientations.length)];

                //Yeni oryantasyonun farklı olması durumunda oryantasyonu değiştirin
                // ve yuvarlak konum, böylece doğru şekilde dönebilir
                if (newOrientation != orientation) {
                    ghost.setOrientation(newOrientation);
                    ghost.position.round();
                }
    
                // İlgili hayaletin nokta sayısını sıfırlama
                this.ticksDirectionChange[index] = 0;
            }
        }
    }

    /**
     * Haritadaki noktaları güncelleyen yöntem.
     */
    updateDots() {
        // 0,5 ekledikten sonra PacMan kırpma konumunu elde edin
        // Bunu yapmanın en iyi yolu olarak görüldü
        var xPos = Math.floor(this.pacman.position.x + 0.5);
        var zPos = Math.floor(this.pacman.position.z + 0.5);

        //Çarpışmış olabileceği küçük ve büyük noktayı alma
        // mevcut durumda PacMan, varsa
        // Adından elde edilir
        var selectedSmallDot = this.getObjectByName("smallDot_" + xPos + "_" + zPos);
        var selectedBigDot = this.getObjectByName("bigDot_" + xPos + "_" + zPos);

        // Küçük bir nokta yenmişse noktalama işaretini güncelleyin
        if (selectedSmallDot != undefined) {
            this.game.decreaseRemainingDots();
            this.game.updateScoreSmallDot();
        }

        // Büyük bir nokta yenilmişse noktalama işaretini güncelleyin ve bunu belirtin
        // hayaletler yenilebilir
        if (selectedBigDot != undefined) {
            this.game.decreaseRemainingDots();
            this.game.updateScoreBigDot();

            this.ghosts.forEach(ghost => ghost.setEdible(true));
            this.game.resetEatenGhosts();
        }

        this.remove(selectedSmallDot);
        this.remove(selectedBigDot);
    }

    /**
     * PacMan'in bir hayaletle çarpışıp çarpışmadığını kontrol eden yöntem.
     * @returns Çarpıştığı hayaleti döndürür.
     */
    checkCollisionWithGhosts() {
        var collided = false;
        var collidedGhost = undefined;

        // PacMan'den kesilmiş konumu alın
        // Noktalarla çarpışmaya benzer bir strateji izleniyor
        var xPacMan = Math.floor(this.pacman.position.x + 0.5);
        var zPacMan = Math.floor(this.pacman.position.z + 0.5);

        // Herhangi biriyle çarpıştıysa, ortaya çıkan hayaletler arasında arama yapın.
        this.ghosts.filter(ghost => ghost.getSpawned()).forEach(function(ghost) {
            // Hayaletin kesik konumunu alın
            var xGhost = Math.floor(ghost.position.x + 0.5);
            var zGhost = Math.floor(ghost.position.z + 0.5);

            // İlk çarpışma aranır ve hayalet kurtarılır.
            // çarpıştıklarını
            if (!collided) {
                collided = xPacMan == xGhost && zPacMan == zGhost;

                if (collided) {
                    collidedGhost = ghost;
                }
            }
        });

        return collidedGhost;
    }

    /**
     *Kalan canları yükseltme yöntemi. 
     *Ömrü 1 azaltın ve bir yaşamı temsil eden listeden son simgeyi kaldırın.
     */
    updateLives() {
        this.game.decreaseRemainingLives();
        var divLives = document.getElementById("lives").getElementsByTagName("img");
        divLives[this.game.getRemainingLives()].style.display = "none";
    }

    /**
     * Belirli bir karakterin haritanın bir tarafından diğerine geçip geçemeyeceğini kontrol eden 
     * ve pozitif durumda bu tür ışınlamayı gerçekleştiren yöntem.
     * @param {Character3D} character Işınlanıp ışınlanamayacağı kontrol edilecek karakter.
     */
    checkTeleportCharacter(character) {
        var position = character.position.clone();
        position.floor();

        // Doğru konumlardaysanız haritanın bir tarafından diğerine geçin
        if (position.z == 14 && position.x > this.objectsMap[0].length - 1) {
            character.position.x = 0;
        } else if (position.z == 14 && position.x < -1) {
            character.position.x = this.objectsMap[0].length - 1;
        }
    }

    /**
     * PacMan'i takip eden kamerayı güncelleyen yöntem.
     */
    updatePacManCamera() {
        this.pacmanCamera.position.set(this.pacman.position.x, 10, this.pacman.position.z + 10);
        this.pacmanCamera.lookAt(this.pacman.position);
    }

    /**
     * Bir Görünüm Penceresi görüntüleyen yöntem.
     * @param {THREE.Scene} scene Oluşturulacak sahne.
     * @param {THREE.Camera} camera Oluşturulacak kamera
     * sahne.
     * @param {number} left Görünüm alanının sol köşesi.
     * @param {number} top Görünüm penceresinin üst köşesi.
     * @param {number} width Görüntü alanı genişliği.
     * @param {number} heightGörüntü alanı yüksekliği.
     * @param {boolean} squareView Görünüm alanının kare olup olmayacağını belirtir.
     */
    renderViewport(scene, camera, left, top, width, height, squareView) {
        var l, w, t, h;
        
        // Normalleştirmeden piksel alma
        if (squareView) {
            l = left * window.innerHeight;
            t = top * window.innerHeight;

            w = width * window.innerHeight;
            h = height * window.innerHeight;            
        } else {
            l = left * window.innerWidth;
            t = top * window.innerHeight;

            w = width * window.innerWidth;
            h = height * window.innerHeight;
        };

        // Oluşturucuya hangi bakış açısının kullanılacağını söyleme ve görüntünün geri kalanını kırpma
        this.renderer.setViewport(l, t, w, h);
        this.renderer.setScissor(l, t, w, h);
        this.renderer.setScissorTest(true);

        // Kameranın en boy oranını ve projeksiyon matrisini güncelleme
        camera.aspect = w/h;
        camera.updateProjectionMatrix();

        // Sahneyi kameraya göre görüntüleme
        this.renderer.render(scene, camera);
    }

    /**
     * Sahneyi güncelleyen yöntem.
     */
    update() {
        // Hayaletlerin yön değişikliği için nokta sayısını güncelleyin
        this.ticksDirectionChange = this.ticksDirectionChange.map(element => element + 1);
        
        // Sahne öğelerini güncelleme
        this.updatePacMan();
        this.updateGhosts();
        this.updateDots();

        // Kalan puanlar varsa, güncellemelerin geri kalanını gerçekleştirme
        if (this.game.getRemainingDots() > 0) {
            // PacMan-Ghost çarpışmasını kontrol etme
            var collidedGhost = this.checkCollisionWithGhosts();
            var collidedWithGhost = collidedGhost != undefined;
    
            //Bir çarpışma durumunda ne tür bir etkileşim meydana geldiğini kontrol edin
            if (collidedWithGhost) {
                if (collidedGhost.getEdible()) {
                    this.game.playEatGhostAudio();

                    this.game.increaseEatenGhosts();
                    this.game.updateScoreEatenGhost();

                    this.respawnSingleGhost(collidedGhost);
                } else {
                    this.game.playDeathAudio();
                    this.updateLives();

                    // Canlar kalırsa, karakterleri sıfırlama
                    if (this.game.getRemainingLives() > 0) {
                        this.resetCharacters();
                    } else {
                        window.alert("You lost :c. Total score: " + this.game.getScore() + " points.\nPress F5  to play again!");
                    }
                }
            } else {
                // Karakterlerin ışınlanmasını kontrol etme
                this.checkTeleportCharacter(this.pacman);
                this.ghosts.forEach(ghost => this.checkTeleportCharacter(ghost));
            }
        } else {
            // Tüm puanların yenmesi durumunda bir sonraki aşamayı yükleme
            window.alert("Stage cleared! Starting new stage...")
            this.loadNextStage();
        }

        // Canlar kalırsa sahnenin yeniden işlenmesi gerektiğini belirtme
        if (this.game.getRemainingLives() > 0) {
            requestAnimationFrame(() => this.update());
        }

        // PacMan kamerayı güncelleme
        this.updatePacManCamera();        
        
        // Render sahnesi ve mini harita
        this.renderViewport(this, this.pacmanCamera, 0, 0, 1, 1, false);
        this.renderViewport(this, this.mapCamera, 0, 0, 0.25, 0.25, true);

        // Noktalama işaretini güncelleme
        document.getElementById('Score').textContent = this.game.getScore();

        // Tween animasyonlarını güncelleme
        TWEEN.update();
    }
}
  
// Belge hazır olduğunda çalışan ana işlev
// Sürüm uygun: $(belge).ready(function() { ... })
$(function () {
    // Sahne, görüntülemek için html'de oluşturulan div'den geçirilerek başlatılır.
    var scene = new Scene("#WebGL-Output");
    
    //Uygulama dinleyicileri eklenir: değişiklikler için bir dinleyici
    // pencere boyutu ve tuş vuruşu için bir tane
    window.addEventListener ("resize", () => scene.onWindowResize());
    window.addEventListener("keypress", (event) => scene.onKeyPress(event));
    
    // Sahne ekranı
    scene.update();
});