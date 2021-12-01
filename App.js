import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  alert,
  Pressable,
} from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';

// @ts-ignore
import playlistData from './react/data/playlist.json';
// @ts-ignore
import localTrack from './react/resources/pure.m4a';
import DocumentPicker from 'react-native-document-picker';
// var mp3Duration = require('mp3-duration');
import Sound from 'react-native-sound';

const App = () => {
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const [trackArtwork, setTrackArtwork] = useState();
  const [trackTitle, setTrackTitle] = useState();
  const [trackArtist, setTrackArtist] = useState();

  const [multipleFile, setMultipleFile] = useState([]);
  const [deviceTrack, setdevicecalTrack] = useState([])


  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (
      event.type === Event.PlaybackTrackChanged &&
      event.nextTrack !== undefined
    ) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      const { title, artist, artwork } = track || {};
      setTrackTitle(title);
      setTrackArtist(artist);
      setTrackArtwork(artwork);
    }
  });

  useEffect(() => {
    setupIfNecessary();
  }, []);


  const setupIfNecessary = async () => {
    // if app was relaunched and music was already playing, we don't setup again.
    const currentTrack = await TrackPlayer.getCurrentTrack();
    if (currentTrack !== null) {
      return;
    }

    await TrackPlayer.setupPlayer({});
    await TrackPlayer.updateOptions({
      stopWithApp: false,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });

    await TrackPlayer.add(playlistData);
    await TrackPlayer.add({
      url: localTrack,
      title: 'Pure (Demo)',
      artist: 'David Chavez',
      artwork: 'https://buffer.com/cdn-cgi/image/w=1000,fit=contain,q=90,f=auto/library/content/images/size/w1200/library/wp-content/uploads/2017/09/13-Places-to-Find-Background-Music-for-Video-Cover-Image-2.jpg',
      duration: 28,
    });

    TrackPlayer.setRepeatMode(RepeatMode.Queue);
  };

  const getmusic = async (musics) => {
    // if app was relaunched and music was already playing, we don't setup again.
    // const currentTrack = await TrackPlayer.getCurrentTrack();
    // if (currentTrack !== null) {
    //   return;
    // }

    await TrackPlayer.setupPlayer({});
    await TrackPlayer.updateOptions({
      stopWithApp: false,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });

    await TrackPlayer.add(musics);

    TrackPlayer.setRepeatMode(RepeatMode.Queue);
  };

  const togglePlayback = async (playbackState: State) => {
    const currentTrack = await TrackPlayer.getCurrentTrack();
    if (currentTrack == null) {
      // TODO: Perhaps present an error or restart the playlist?
    } else {
      if (playbackState !== State.Playing) {
        await TrackPlayer.play();
      } else {
        await TrackPlayer.pause();
      }
    }
  };

  const selectMultipleFile = async () => {
    //Opening Document Picker for selection of multiple file
    try {
      const results = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.audio],
        //There can me more options as well find above
      });
      console.log("results", results)
      //  mp3Duration(results[0].uri).then( function (err, duration) {
      //     if (err) return console.log(err.message);
      //     console.log('Your file is ' + duration + ' seconds long');
      //   });

      // loadRecording() {
      let recordingFilePath = results[0].uri;
      console.log("recordingFilePath", recordingFilePath)
      let soundFile = new Sound(recordingFilePath, '', (error) => {
        console.log('duration in seconds: ' + soundFile.getDuration() + ', number of channels: ' + soundFile.getNumberOfChannels());
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
        // loaded successfully
        console.log('duration in seconds: ' + soundFile.getDuration() + ', number of channels: ' + soundFile.getNumberOfChannels());
      });
      // }

      // setTrackTitle(results[0].name);
      // setTrackArtist("Prasanna");
      // setTrackArtwork("https://buffer.com/cdn-cgi/image/w=1000,fit=contain,q=90,f=auto/library/content/images/size/w1200/library/wp-content/uploads/2017/09/13-Places-to-Find-Background-Music-for-Video-Cover-Image-2.jpg");

      var music_arr = []
      for (const res of results) {
        var details = {
          url: res.uri,
          title: res.name,
          artist: 'Prasanna',
          artwork: 'https://buffer.com/cdn-cgi/image/w=1000,fit=contain,q=90,f=auto/library/content/images/size/w1200/library/wp-content/uploads/2017/09/13-Places-to-Find-Background-Music-for-Video-Cover-Image-2.jpg',
          duration: 60,
        }
        music_arr.push(details)
        //Printing the log realted to the file
        // console.log('res : ' + JSON.stringify(res));
        // console.log('URI : ' + res.uri);
        // console.log('Type : ' + res.type);
        // console.log('File Name : ' + res.name);
        // console.log('File Size : ' + res.size);
      }


      getmusic(music_arr)
      //Setting the state to show multiple file attributes
      setMultipleFile(results);
    } catch (err) {
      //Handling any exception (If any)
      if (DocumentPicker.isCancel(err)) {
        //If user canceled the document selection
        alert('Canceled from multiple doc picker');
      } else {
        //For Unknown Error
        alert('Unknown Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  };


  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle={'light-content'} />
      <View style={styles.contentContainer}>
        <View style={styles.topBarContainer}>
          <TouchableWithoutFeedback >
            <Text style={styles.queueButton}>Queued MP3 \/</Text>
          </TouchableWithoutFeedback>
        </View>

        <Image style={styles.artwork} resizeMode={"cover"} source={{ uri: `${trackArtwork}` }} />
        <Text style={styles.titleText}>{trackTitle}</Text>
        <Text style={styles.artistText}>{trackArtist}</Text>
        <Slider
          style={styles.progressContainer}
          value={progress.position}
          minimumValue={0}
          maximumValue={progress.duration}
          thumbTintColor="#FFD479"
          minimumTrackTintColor="#FFD479"
          maximumTrackTintColor="#FFFFFF"
          onSlidingComplete={async value => {
            await TrackPlayer.seekTo(value);
            
          }}
        />

        <View style={styles.progressLabelContainer}>
          <Text style={styles.progressLabelText}>
            {new Date(progress.position * 1000).toISOString().substr(14, 5)}
          </Text>
          <Text style={styles.progressLabelText}>
            {new Date((progress.duration - progress.position) * 1000)
              .toISOString()
              .substr(14, 5)}
          </Text>
        </View>
      </View>

      <View style={styles.actionRowContainer}>
        <TouchableWithoutFeedback onPress={() => TrackPlayer.skipToPrevious()}>
          <Text style={styles.secondaryActionButton}>Prev</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => togglePlayback(playbackState)}>
          <Text style={styles.primaryActionButton}>
            {playbackState === State.Playing ? 'Pause' : 'Play'}
          </Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => TrackPlayer.skipToNext()}>
          <Text style={styles.secondaryActionButton}>Next</Text>
        </TouchableWithoutFeedback>
      </View>

      <View style={{ height: 60, width: "100%", alignItems: "center", justifyContent: "center", marginBottom:70 }}>
        <Pressable style={{ borderColor: "#FFD479", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 50 / 2, borderWidth: 1, width: 200, }}
          onPress={() => { selectMultipleFile() }}
        >
          <Text style={{ color: "#FFD479" }} >Select musics</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#212121',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  topBarContainer: {
    width: '100%',
    // flexDirection: 'row',
    marginTop:30,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems:"center",
    // backgroundColor: "red"
  },
  queueButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD479',
  },
  artwork: {
    width: 400,
    height: 240,
    marginTop: 30,

    backgroundColor: 'grey',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 30,
    textAlign:"center",
  },
  artistText: {
    fontSize: 16,
    fontWeight: '200',
    color: 'white',
  },
  progressContainer: {
    height: 40,
    width: 380,
    marginTop: 25,
    flexDirection: 'row',
  },
  progressLabelContainer: {
    width: 370,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelText: {
    color: 'white',
    fontVariant: ['tabular-nums'],
  },
  actionRowContainer: {
    width: '60%',
    flexDirection: 'row',
    marginBottom: 100,
    justifyContent: 'space-between',
  },
  primaryActionButton: {
    // fontSize: 18,
    fontWeight: '600',
    color: '#FFD479',
    borderColor: "#FFD479",
    borderRadius: 25, borderWidth: 1, padding: 10
  },
  secondaryActionButton: {
    // fontSize: 18,
    fontWeight: '600',
    color: '#FFD479',
    borderColor: "#FFD479",
    borderRadius: 25, borderWidth: 1, padding: 10
  },
});

export default App;
