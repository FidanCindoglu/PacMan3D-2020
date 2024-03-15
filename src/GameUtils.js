/**
 * Noktalama işaretleri, seviye, canlar vb. gibi oyunun bazı unsurlarını temsil eden sınıf.
 */
class GameUtils {
    constructor() {
        this.remainingLives = 3;
        this.remainingDots = 0;
        this.score = 0;

        this.pacmanSpeed = 3;
        this.ghostSpeed = 2.5;
        this.SPEED_INCREMENT = 0.5;
        this.MAX_PACMAN_SPEED = 5.5;
        this.MAX_GHOST_SPEED = 5;

        this.SMALL_DOT_POINTS = 10;
        this.BIG_DOT_POINTS = 50;
        this.GHOST_POINTS = 200;

        this.eatenGhosts = 0;

        this.LEVEL_MAP = [
            "############################",
            "#............##............#",
            "#.####.#####.##.#####.####.#",
            "#o####.#####.##.#####.####o#",
            "#.####.#####.##.#####.####.#",
            "#..........................#",
            "#.####.##.########.##.####.#",
            "#.####.##.########.##.####.#",
            "#......##....##....##......#",
            "######.##### ## #####.######",
            "     #.##### ## #####.#     ",
            "     #.##     G    ##.#     ",
            "     #.## ######## ##.#     ",
            "######.## #      # ##.######",
            "      .   #      #   .      ",
            "######.## #      # ##.######",
            "     #.## ######## ##.#     ",
            "     #.##          ##.#     ",
            "     #.## ######## ##.#     ",
            "######.## ######## ##.######",
            "#............##............#",
            "#.####.#####.##.#####.####.#",
            "#.####.#####.##.#####.####.#",
            "#o..##....... P.......##..o#",
            "###.##.##.########.##.##.###",
            "###.##.##.########.##.##.###",
            "#......##....##....##......#",
            "#.##########.##.##########.#",
            "#.##########.##.##########.#",
            "#..........................#",
            "############################"
        ];

        this.correspondence = {
            '#': cellType.WALL,
            ' ': cellType.EMPTY,
            '.': cellType.SMALL_DOT,
            'o': cellType.BIG_DOT,
            'P': cellType.PACMAN,
            'G': cellType.GHOST
        }

        // Oyunun başındaki ses
        this.beginningAudio = new Audio("audio/pacman_beginning.wav");
        this.beginningAudio.autoplay = true;
        this.beginningAudio.preload = "auto";
        this.beginningAudio.volume = 0.5;

        // PacMan'in bir hayaleti ne zaman yediğine dair ses
        this.eatGhostAudio = new Audio("audio/pacman_eatghost.wav");
        this.eatGhostAudio.preload = "auto";
        this.eatGhostAudio.volume = 0.5;

        // PacMan'in ne zaman öldüğüne dair ses
        this.deathAudio = new Audio("audio/pacman_death.wav");
        this.deathAudio.preload = "auto";
        this.deathAudio.volume = 0.5;
    }

    getRemainingLives() {
        return this.remainingLives;
    }

    decreaseRemainingLives() {
        this.remainingLives--;
    }

    getRemainingDots() {
        return this.remainingDots;
    }

    increaseRemainingDots() {
        this.remainingDots++;
    }

    decreaseRemainingDots() {
        this.remainingDots--;
    }

    getScore() {
        return this.score;
    }

    updateScoreSmallDot() {
        this.score += this.SMALL_DOT_POINTS;
    }

    updateScoreBigDot() {
        this.score += this.BIG_DOT_POINTS;
    }

    updateScoreEatenGhost() {
        this.score += Math.pow(2, this.eatenGhosts - 1) * this.GHOST_POINTS;
    }

    getEatenGhosts() {
        return this.eatenGhosts;
    }

    increaseEatenGhosts() {
        this.eatenGhosts++;
    }

    resetEatenGhosts() {
        this.eatenGhosts = 0;
    }

    getPacmanSpeed() {
        return this.pacmanSpeed;
    }

    /**
     * PacMan'in maksimum hızı aşmaması durumunda hızını artırma yöntemi.
     */
    increasePacmanSpeed() {
        if (this.pacmanSpeed < this.MAX_PACMAN_SPEED) {
            this.pacmanSpeed += this.SPEED_INCREMENT;
        }
    }

    getGhostSpeed() {
        return this.ghostSpeed;
    }

    /**
     * Maksimumu aşmaması durumunda hayaletlerin hızını artırma yöntemi.
     */
    increaseGhostSpeed() {
        if (this.ghostSpeed < this.MAX_GHOST_SPEED) {
            this.ghostSpeed += this.SPEED_INCREMENT;
        }
    }

    getLevelMap() {
        return this.LEVEL_MAP;
    }

    getCorrespondence() {
        return this.correspondence;
    }

    playBeginningAudio() {
        this.beginningAudio.play();
    }

    playEatGhostAudio() {
        this.eatGhostAudio.play();
    }

    playDeathAudio() {
        this.deathAudio.play();
    }
}
