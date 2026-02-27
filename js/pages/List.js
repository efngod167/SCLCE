import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 100" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">FPS</div>
                            <p>{{ level.fps || 'Any' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 100"><strong>{{ level.percentToQualify }}%</strong> to qualify</p>
                    <p v-else-if="selected +1 <= 100"><strong>100%</strong> to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{record.percent||100}}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}fps</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Submission Requirements</h3>
                    <p>
                        The difficulty must be almost all in the spam of the level. You are allowed to put a triple spike or a timing at the end or beginning.
                    </p>
                    <p>
                        You are not allowed to use methods of spamming that require little effort for very high amounts of CPS, such as drag clicking, bolt clicking, alt jittering etc.
                    </p>
                    <p>
                        There are no deco rules. This will change if the list gets spammed with lame challenges!
                    </p>
                    <p>
                        The lowest respawn time is 0.5 seconds.
                    </p>
                    <p>
                        A maximum of 2 inputs are allowed when spamming.
                    </p>
                    <p>
                        Because of the changes to FPS in 2.2, Physics Bypass is NOT ALLOWED FOR FPS VALUES ABOVE 240. For levels already on the list you may beat them in 2.1 (you can use 59-360 FPS). If you don't know how to revert to 2.1, you may click on <a style="color: #03bafc" href="https://www.youtube.com/watch?v=JMBn04BWTJc">this tutorial</a> for more understanding. Click Between Frames is however, not allowed.
                    </p>
                    <p>
                        Intentional abuse to cap out CPS built into hardware is banned.
                    </p>
                    <p>
                        Rebinding keys is allowed as long as you use only 2 or less keys!
                    </p>
                    <p>
                        Maximum of 4 fingers for all spam methods/levels.
                    </p>
                    <p>
                        Stating hardware used is required for difficult completions. Rapid Trigger must be off.
                    </p>
                    <p>
                        You cannot pause in a level unless it is after the spam.
                    </p>
                    <p>
                        Your level must not contain too many elements from 2.2, such as triggers, shaders etc. The owners/mods will have a discussion about the level, and will determine if it uses too many 2.2 additions. If it uses too many 2.2 additions, we will alert the creator, and it will need a reverification. No questions asked.
                    </p>
                    <h3>Marginal Note</h3>
                    <p>
                        Every spam-based level included in this list must originate from the game <a style="color: #03bafc" href="https://en.wikipedia.org/wiki/Geometry_Dash">Geometry Dash</a>. This list ranks the top 100 hardest spam challenges in the game and is strictly a classic edition of SCL (The Spam Challenge List), meaning all entries must rely on traditional, manual spamming skill. The difficulty of each level must reflect raw speed, control, consistency, and endurance using authentic classic spam mechanics.
                    </p>
                    <p>
                        SCLCE (or Spam Challenge List) is a fan-made project and is not affiliated with, endorsed by, or associated with RobTopGames AB® in any way. It is also an unofficial project of SCL, and is also not affiliated with, connected to, or endorsed by that list. This project operates independently, similar to other community-run lists such as TSL (The Shitty List) and TLL (The Layout List). Furthermore, this list was created out of appreciation for the spam challenge community and as a way to celebrate and preserve the classic style of spam gameplay. Inspired by existing lists such as SCL, this project aims to provide a dedicated space for traditional, manual spam challenges while maintaining fairness, authenticity, and respect for the broader community.
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
