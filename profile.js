const fs = require('fs').promises;
const path = require('path');

const CONFIG_DIR = process.env.CONFIG_DIR;
const HOME_DIR = process.env.HOME;

const switchProfile = async (profile) => {
    if (!['work', 'home'].includes(profile)) {
        throw new Error('Profile must be either "work" or "home"');
    }

    const config = {
        npmrc: {
            source: path.join(CONFIG_DIR, 'npmrcs', profile),
            target: path.join(HOME_DIR, '.npmrc')
        },
        gitconfig: {
            source: path.join(CONFIG_DIR, 'gitconfigs', profile),
            target: path.join(HOME_DIR, '.gitconfig')
        }
    };

    for (const [type, paths] of Object.entries(config)) {
        try {
            // Read the source file
            const content = await fs.readFile(paths.source, 'utf8');
            
            // Write content to target file
            await fs.writeFile(paths.target, content, 'utf8');
            
            console.log(`Successfully updated ${paths.target} with ${profile} configuration`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error(`Error: Could not find ${profile} configuration file at ${paths.source}`);
            } else {
                console.error(`Error updating ${type} configuration:`, error.message);
            }
        }
    }
}

const profile = process.argv[2];

if (!profile) {
    console.error('Usage: node profile.js [work|home]');
    process.exit(1);
}

switchProfile(profile)
    .then(() => console.log('Profile switch completed'))
    .catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    });