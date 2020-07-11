
import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Modal,
  Keyboard,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
const AppTheme = '#FE6801'
const APIURL = "https://api.binance.com/api/v1/ticker/price";
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModal: false,
      input: '',
      isinput: false,
      isKeyboard: false,
      data: [],
      isSortSymobBy: "asc",
      isSortPriceBy: "asc",
      errorMessage: "",
      isError: false,
    }
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
  }
  async componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide)
    var data = await AsyncStorage.getItem("data");

    if (data) {
      this.setState({
        data: JSON.parse(data),
      });
    }
    setInterval(() => {
      this.setStatus();
    }, 2000);

    setInterval(() => {
      this.freshData();
    }, 5000);
  }
  _keyboardDidShow() {

    this.setState({
      isKeyboard: true
    })
  }


  _keyboardDidHide() {
    this.setState({
      isKeyboard: false
    })
  }
  toggleModal = () => {
    this.setState({
      isModal: !this.state.isModal
    })
  }

  onChangeText = (input) => {
    try {
      this.setState({
        input: input,
        errorMessage: "",
        isError: false,
      })
    }
    catch (e) {
      console.log("onChangeText Exception", e)
    }
  }
  addSymbol = () => {
    try {
      this.toggleModal()
      console.log(" this.state.input", this.state.input)
      let symbol = "?symbol=";
      fetch(APIURL + symbol + this.state.input)
        .then((res) => res.json())
        .then((result) => {
          if (!result.code) {
            let temp = this.state.data;
            if (temp.filter((a) => a.symbol == this.state.input).length == 0) {
              result.isChanged = 0;
              temp.push(result);
              AsyncStorage.setItem("data", JSON.stringify(temp));
              this.setState({
                isError: false,
                data: temp,
                errorMessage: "",
                input: "",
              });
            } else {
              this.setState({
                isError: true,
                errorMessage: "symbol already present",
                input: "",
              });
            }
          } else {
            this.setState({
              isError: true,
              errorMessage: result.msg,
              input: "",
            });
          }
        })
        .catch((e) => console.log("e", e));
    }
    catch (e) {
      console.log("addSymbol Exception", e);
    }
  };

  removeSymbol = (item) => {
    try {
      var temp = this.state.data.filter((a) => a.symbol != item.symbol);
      AsyncStorage.setItem("data", JSON.stringify(temp));
      this.setState({
        data: temp,
      });
    } catch (e) {
      console.log("removeSymbol Exception", e)
    }
  };

  sortBySymbol = () => {
    try {
      if (this.state.isSortSymobBy == "asc") {
        let temp = this.state.data.sort((a, b) => {
          return a.symbol == b.symbol ? 0 : +(a.symbol > b.symbol) || -1;
        });
        this.setState({
          data: temp,
          isSortSymobBy: "desc",
        });
      } else {
        let temp = this.state.data.sort((a, b) => {
          return a.symbol == b.symbol ? 0 : +(a.symbol < b.symbol) || -1;
        });
        this.setState({
          data: temp,
          isSortSymobBy: "asc",
        });
      }
    } catch (e) {
      console.log("sortBySymbol Exception", e)
    }
  };

  sortByPrice = () => {
    try {
      if (this.state.isSortPriceBy == "asc") {
        let temp = this.state.data.sort((a, b) => {
          return a.price == b.price ? 0 : +(a.price > b.price) || -1;
        });
        this.setState({
          data: temp,
          isSortPriceBy: "desc",
        });
      } else {
        let temp = this.state.data.sort((a, b) => {
          return a.price == b.price ? 0 : +(a.price < b.price) || -1;
        });
        this.setState({
          data: temp,
          isSortPriceBy: "asc",
        });
      }
    } catch (e) {
      console.log("sortByPrice Exception", e)
    }
  };
  setStatus = () => {
    let temp = this.state.data;
    for (var i = 0; i < temp.length; i++) {
      temp[i].isChanged = 0;
    }
    this.setState({
      data: temp,
    });
  };

  freshData = () => {
    fetch(APIURL)
      .then((res) => res.json())
      .then((result) => {
        var data = result.filter((a) =>
          this.state.data.find((b) => b.symbol == a.symbol)
        );
        var temp = this.state.data;
        for (var i = 0; i < data.length; i++) {
          for (var j = 0; j < temp.length; j++) {
            if (data[i].symbol == temp[j].symbol) {
              if (data[i].price > temp[j].price) {
                temp[j].isChanged = 1;
                temp[j].price = data[i].price;
              } else if (data[i].price < temp[j].price) {
                temp[j].isChanged = 2;
                temp[j].price = data[i].price;
              } else {
                temp[j].isChanged = 0;
                temp[j].price = data[i].price;
              }
            }
          }
        }
        this.setState({
          data: temp,
        });
      });
  };
  render() {
    return (
      <View style={styles.parentView}>

        <StatusBar
          barStyle="light-content"
          translucent={false}
          backgroundColor={AppTheme}
        />
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Main Page
          </Text>
        </View>
        <TouchableOpacity
          style={styles.actionFlotingBtn}
          onPress={() => this.toggleModal()}
        >
          <Text style={styles.headerText}>+</Text>
        </TouchableOpacity>

        <ScrollView >

          <View style={styles.tableBody}>
            {this.state.isError && (
              <View style={styles.errorView}>
                <Text style={styles.errorViewText}>
                  {this.state.errorMessage}
                </Text>
              </View>
            )}
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderView, { flex: 1 }]}>
                <Text style={styles.tableHeaderText}>
                  #
                </Text>
              </View>
              <View onPress={() => this.sortBySymbol} style={styles.tableHeaderView}>
                <Text style={styles.tableHeaderText}>
                  Symbol
                </Text>
              </View>
              <View onPress={() => this.sortByPrice} style={styles.tableHeaderView}>
                <Text style={styles.tableHeaderText}>
                  Price
                </Text>
              </View>

              <View style={[styles.tableHeaderView, { borderRightWidth: 1 }]}>
                <Text style={styles.tableHeaderText}>
                  Action
                </Text>
              </View>

            </View>
            {this.state.data.length > 0 &&

              <View>
                {this.state.data.map((item, index) => {
                  return (
                    <View key={index} style={[styles.tableHeader, {
                      backgroundColor: item.isChanged == 1
                        ? "#d4edda"
                        : item.isChanged == 2
                          ? "#f8d7da"
                          : "#FFF"
                    }]} >
                      <View style={[styles.tableRowView, { flex: 1 }]}>
                        <Text style={styles.tableRowText}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.tableRowView}>
                        <Text style={styles.tableRowText}>
                          {item.symbol}
                        </Text>
                      </View>
                      <View style={styles.tableRowView}>
                        <Text style={styles.tableRowText}>
                          {item.price}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => this.removeSymbol(item)}
                        style={[styles.tableRowView, { borderRightWidth: 1 }]}>
                        <Text style={styles.tableRowText}>
                          Remove
                </Text>
                      </TouchableOpacity>

                    </View>
                  )
                })}
              </View>

            }
          </View>
        </ScrollView>


        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.isModal}
          onRequestClose={() => {
            this.toggleModal()
          }}

        >
          <View style={{ elevation: 10, backgroundColor: '#fff', borderRadius: 10, top: '40%', height: (this.state.isKeyboard) ? '45%' : '25%', width: '86%', marginHorizontal: '7%', }}>
            <View style={styles.parentModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.headerModalText}>
                  Enter new Symbol
                 </Text>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.modalBodyView}>
                  <TextInput
                    placeholder="Enter Symbol"
                    style={styles.modalTextFeild}
                    onChangeText={(e) => this.onChangeText(e)}
                  />
                </View>
                <View style={styles.modalBtnView}>
                  <TouchableOpacity
                    onPress={() => this.toggleModal()}
                    style={styles.modalBtn}>
                    <Text style={styles.modalBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.addSymbol()}
                    style={styles.modalBtn}>
                    <Text style={styles.modalBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View >
          </View>
        </Modal>
      </View >
    );
  }
}


const styles = StyleSheet.create({
  parentView: {
    width: '100%',
    height: '100%',
    zIndex: -1
  },
  header: {
    width: '100%',
    height: 55,
    backgroundColor: AppTheme,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: 'bold'
  },
  actionFlotingBtn: {
    bottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    right: 10,
    position: 'absolute',
    zIndex: 1999,
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: AppTheme
  },
  headerModalText: {
    color: "#000",
    paddingTop: 0,
    paddingLeft: 10,
    fontSize: 20,
    fontWeight: 'bold'
  },
  modalHeader: {
    margin: 5,
    marginVertical: 5,
    padding: 5,
    height: 50,
    justifyContent: 'center',
  },
  parentModal: {
    width: '100%',
    height: '100%'
  },
  modalparentView: {
    elevation: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    top: '340%',
    height: '20%',
    width: '86%',
    marginHorizontal: '7%',
  },
  modalBtnView: {
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    height: 40
  },
  modalBtn: {
    width: 60,
    marginHorizontal: 5
  },
  modalBtnText: {
    color: AppTheme,
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalTextFeild: {
    borderColor: "#d2d2d2",
    borderBottomWidth: 1
  },
  modalBody: {
    height: '78%',
  },
  modalBodyView: {
    width: '90%',
    marginHorizontal: '5%',
    justifyContent: 'center'
  },
  tableBody: {
    marginTop: 10,
    width: '96%',
    marginHorizontal: '2%',

  },
  tableHeader: {
    flexDirection: "row",
    height: 50,
    flex: 7,
    alignItems: 'center'
  },
  tableHeaderView: {
    // width: 100,
    flex: 2,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: "#d2d2d2",
    backgroundColor: AppTheme,
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 10,
    color: '#fff',
    paddingBottom: 10
  },
  tableRow: {
    flexDirection: "row",
    height: 50,
    flex: 7,
    alignItems: 'center'
  },
  tableRowView: {
    flex: 2,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: "#d2d2d2",

  },
  tableRowText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 10,
    color: '#000',
    paddingBottom: 10
  },
  errorView: {
    alignSelf: "center"
  },
  errorViewText: {
    borderRadius: 10,
    color: '#fa3335',
    textAlign: 'center',
    backgroundColor: '#ffe0e0',
    padding: 2,
    paddingHorizontal: 20,
    fontSize: 14
  },
});

export default App;
