# The recordings in this folder

Four animals stand in for ten dinosaurs: each is played faster or slower to
suit the dinosaur it is given to (see `src/audio/voices.ts`), and only the
stretch of it named in `manifest.json` is used.

| File | What it is | Where it came from | Terms |
|---|---|---|---|
| `roar.mp3` | A lion roaring | Wikimedia Commons, *Lion raring-sound1TamilNadu178* — https://commons.wikimedia.org/wiki/File:Lion_raring-sound1TamilNadu178.ogg (the MP3 version Commons serves) | Released into the public domain by the person who recorded it |
| `bellow.mp3` | A bison bellowing | US National Park Service, Yellowstone Sound Library, *Bison (bellow)*, recorded by Shan Burson — https://www.nps.gov/yell/learn/photosmultimedia/sounds-bison.htm | Public domain. The Park Service asks to be credited where appropriate: this is that credit |
| `screech.mp3` | A bald eagle calling | US National Park Service, Natural Sounds gallery, *Bald Eagle* — https://www.nps.gov/subjects/sound/sounds-bald-eagle.htm | Public domain; credit: National Park Service |
| `hiss.mp3` | An alligator hissing | US Fish and Wildlife Service, *Alligator Hiss*, as kept at the Internet Archive — https://archive.org/details/animalsounds1 | Public domain; credit: US Fish and Wildlife Service |

Downloaded 2026-10-02. To use a different recording for a voice, put the file
here and change its line in `manifest.json`: `from` and `seconds` are the
stretch of the file that is the call, `body` is how far into that stretch the
loud part starts (short calls are cut from there), `level` is how loud it
is made, as an average, where 1 is as loud as a sound can be, and `clear`
takes out everything below that many hertz — the wind on the microphone,
which is most of what the eagle's recording is by weight.
